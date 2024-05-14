<template>
  <a-upload-dragger v-model:fileList="fileList" name="file" :multiple="true" :custom-request="customRequest"
    :progress="progress" @change="handleChange" @drop="handleDrop" @remove="handleRemove">
    <!-- :before-upload="beforeUpload" -->
    <br />
    <p class="ant-upload-drag-icon">
      <InboxOutlined></InboxOutlined>
    </p>
    <br />
    <p class="ant-upload-text">Click or drag file to this area to upload</p>
    <br />

  </a-upload-dragger>
</template>
<script setup>
import { ref } from 'vue';
import { InboxOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { ENDPOINTS } from '@/api.config.js';
import axios from 'axios';

const fileList = ref([]);
const handleChange = info => {
  const { file, fileList } = info;

  const status = file.status;
  if (status !== 'uploading') {
    console.log(file, fileList)
  }
  if (status === 'done') {
    message.success(`${file.name} file uploaded successfully.`);

  } else if (status === 'error') {
    message.error(`${file.name} file upload failed.`);
  }
};
function handleDrop(e) {
  console.log(e);
}

const fileDetailsMap = ref(new Map());
const handleRemove = async (file) => {
  file.status = "removed";

  updateFileStatusToRemoved(file.uid);

}

const updateFileStatusToRemoved = (fileUID) => {
  const details = fileDetailsMap.value.get(fileUID);
  if (details) {
    fileDetailsMap.value.set(fileUID, { objectname: details.objectname, uploadID: details.uploadID, taskID: details.taskID, status: "removed" }); // Update the file details map
  }
  if (cancel) {
    cancel(); // 打断axios上传
  }
};


async function TaskAbort(objectname, uploadID, taskID) {
  try {
    const raw = JSON.stringify({
      "bucketname": userInfo.value.bucketname,
      "objectname": objectname,
      "uploadID": uploadID,
      "taskID": taskID
    });
    const response = await axios.post(ENDPOINTS.s3.upload.task.abort, raw,{
      withCredentials: true,
    });
    console.log(response)
  } catch (error) {
    console.log(error)
  }
};
const progress = {
  strokeColor: {
    '0%': '#fbc2eb',
    '100%': '#a6c1ee',
  },
  strokeWidth: 5,
  format: percent => `${parseFloat(percent.toFixed(2))}%`,
};

const userInfo = ref(JSON.parse(localStorage.getItem('userInfo')));
const chunkSize = 60 * 1024 * 1024;
const criticalFileSize = 1024 * 1024 * 1024; //临界文件大小 1G 
const currentPrefix = sessionStorage.getItem("currentPrefix");
const customRequest = async (options) => {
  const { file, onSuccess, onError, onProgress } = options;
  const objectname = currentPrefix + file.name;

  try {
    //大于1G就要分片上传啊
    if (file.size > criticalFileSize) {
      // 大文件上传逻辑
      const partsAndIndex = await cutAndIndexFile(file);
      const uploadDetailsAndTaskID = await getUploadURLsAndUploadID(file, objectname, partsAndIndex.maxPartNumber);
      //上传分片
      const eTagsAndStatus = await uploadFileParts(partsAndIndex.chunks, uploadDetailsAndTaskID.uploadDetails, uploadDetailsAndTaskID.taskID, file, onProgress);
      //通知合并分片
      const ok = await completeMultipartUpload( objectname, uploadDetailsAndTaskID.uploadDetails.uploadID, partsAndIndex.maxPartNumber, eTagsAndStatus, uploadDetailsAndTaskID.taskID);
      if (ok === true) {
        onSuccess("Large file uploaded successfully.", file);
      } else {
        onError("Large file uploaded complete Multipart faild or abort", file);
      }

    } else {
      // 小文件直接上传
      const urlAndTaskID = await getUploadURL(file, objectname)
      const ok = await singleFileUpload(urlAndTaskID.url, file, urlAndTaskID.taskID, onProgress);
      if (ok === true) {
        onSuccess("Small file uploaded successfully.", file);
      } else {
        onError("Small file uploaded faild", file);
      }

    }
  } catch (error) {
    onError(file);
    message.error('File upload failed: ' + error.message);
  }
}

// 辅助函数定义
async function getUploadURL(file, objectname) {
  try {
    const raw = JSON.stringify({
      "bucketname": userInfo.value.bucketname,
      "objectname": objectname,
    });
    console.log(raw)

    const response = await axios.post(ENDPOINTS.s3.upload.smallFile, raw, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json"
      }
    });
    console.log(response)
    const taskID = await saveTaskInfo(file, objectname, "----");

    const url = response.data.data.uploadUrl;

    fileDetailsMap.value.set(file.uid, { objectname: objectname, uploadID: "----", taskID: taskID, status: "uploading" });

    return { url, taskID }
  } catch (error) {
    console.error('An error occurred during get uploadUrl:', error);
  }
}


async function getUploadURLsAndUploadID(file, objectname, maxPartNumber) {

  try {
    const raw = JSON.stringify({
      "bucketname": userInfo.value.bucketname,
      "objectname": objectname,
      "maxPartNumber": maxPartNumber,
    });

    // 使用JSON传递数据
    const response = await axios.post(ENDPOINTS.s3.upload.bigFile.create, raw, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json"
      }
    });
    const uploadDetails = response.data.data;
    const taskID = await saveTaskInfo(file, objectname, uploadDetails.uploadID);

    console.log(file)
    fileDetailsMap.value.set(file.uid, { objectname: objectname, uploadID: uploadDetails.uploadID, taskID: taskID, status: "uploading" });
    // }
    return { uploadDetails, taskID }
  } catch (error) {
    console.error('An error occurred during get filelist:', error);
  }
}


async function uploadFileParts(chunks, uploadDetails, taskID, file, onProgress) {
  let eTags = [];
  let uploadedChunks = 0; // 已上传的分片数
  for (let i = 0; i < chunks.length; i++) {

    const details = fileDetailsMap.value.get(file.uid);
    if (details.status === "removed") {
      try {
        await TaskAbort(details.objectname, details.uploadID, details.taskID);

        fileDetailsMap.value.delete(file.uid);
      } catch (error) {
        console.error('Error removing task:', error);
        // 处理错误情况
      }
      const status = details.status
      return { eTags, status }
    }

    const url = uploadDetails.presignedURLs[i];
    const chunk = chunks[i];
    try {
      // 使用JSON传递数据
      const response = await axios.put(url, chunk);
      eTags.push(response.headers.etag); // 收集每个分块的ETag
      uploadedChunks++; // 增加已上传的分片数

      // 更新进度
      const percent = Math.round((uploadedChunks / chunks.length) * 100);
      onProgress({ percent: percent }, file);
      updatePrecent(taskID, percent);
    } catch (error) {
      console.error('An error occurred during upload:', error);
    }
  }
  const status = "done"
  return { eTags, status }
}

async function completeMultipartUpload(objectname, uploadID, maxPartNumber, eTagsAndStatus, taskID) {

  if (eTagsAndStatus.status === "removed") {
    return false
  }

  try {
    const raw = JSON.stringify({
      "bucketname": userInfo.value.bucketname,
      "objectname": objectname,
      "uploadID": uploadID,
      "maxPartNumber": maxPartNumber,
      "eTags": eTagsAndStatus.eTags,
    });

    const response = await axios.post(ENDPOINTS.s3.upload.bigFile.finish, raw, {
      withCredentials: true,
    });
    const ok = await TaskDone(taskID)
    if (response.status === 200 && ok) {
      return true
    }
  } catch (error) {
    console.error('An error occurred during upload:', error);
    return false
  }
}



const ChancelToken = axios.CancelToken;
let cancel;

async function singleFileUpload(url, file, taskID, onProgress) {

  try {
    // 使用JSON传递数据
    const response = await axios.put(url, file, {
      headers: {
        "Content-Type": file.type,
      },
      onUploadProgress: (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress({ percent: percent }, file);
        updatePrecent(taskID, percent);
      },

      cancelToken: new ChancelToken(function executor(c) {
        cancel = c;
      })
    })

    const details = fileDetailsMap.value.get(file.uid);
    if (details.status === "removed") {
      try {
        await TaskAbort(details.objectname, details.uploadID, details.taskID);

        fileDetailsMap.value.delete(file.uid);
      } catch (error) {
        console.error('Error removing task:', error);
        // 处理错误情况
      }
      return false
    }

    const ok = await TaskDone(taskID)
    if (response.status === 200 && ok) {
      return true
    }
  } catch (error) {
    if (axios.isCancel(error)) {
      // 如果请求被用户取消，这里可以静默处理或者执行一些清理工作
      console.log('Upload cancelled by user');
      return false; // 或者根据需要处理
    } else {
      console.error('An error occurred during upload:', error);
      return false;
    }
  }
}

async function cutAndIndexFile(file) {

  const chunks = [];
  let start = 0;
  const fileSize = file.size;
  for (let i = 0; start < fileSize; i++) {
    let end = start + chunkSize;
    if (end > fileSize) {
      end = fileSize;
    }

    // 创建文件分片 Blob
    const chunk = file.slice(start, end);
    chunks.push(chunk);
    start = end;
  }
  const maxPartNumber = chunks.length
  // 返回分片数组及分片数
  return { chunks, maxPartNumber };
}

// 放在上传之前
async function saveTaskInfo(file, objectname, uploadID) {

  try {
    const raw = JSON.stringify({
      "bucketname": userInfo.value.bucketname,
      "objectname": objectname,
      "uploadID": uploadID,
      "filename": file.name,
      "size": file.size,
    });

    const response = await axios.put(ENDPOINTS.s3.upload.task.add, raw, {
      withCredentials: true,
    });
    if (response.status === 200) {
      return response.data.data.taskID
    }
  } catch (error) {
    console.log(error)
    return -10086
  }
}

async function updatePrecent(taskID, percent) {
  try {
    const raw = JSON.stringify({
      "taskID": taskID,
      "percent": percent,
    });
    const response = await axios.put(ENDPOINTS.s3.upload.task.percentUpdate, raw, {
      withCredentials: true,
    });
    if (response.status == 200) {
      console.log(taskID, "percent updated")
    }
  } catch (error) {
    console.log(error)
  }
}

async function TaskDone(taskID) {
  try {
    const raw = JSON.stringify({
      "taskID": taskID,
    });
    const response = await axios.put(ENDPOINTS.s3.upload.task.done, raw, {
      withCredentials: true,
    });
    if (response.status === 200) {
      return true
    }
  } catch (error) {
    console.log(error)
    return false
  }
}


</script>