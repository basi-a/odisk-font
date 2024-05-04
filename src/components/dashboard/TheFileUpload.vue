<template>
  <a-upload-dragger v-model:fileList="fileList" name="file" :multiple="true" :custom-request="customRequest"
    @change="handleChange" @drop="handleDrop">
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
      // console.log("big");
      // 大文件上传逻辑
      const partsAndIndex = await cutAndIndexFile(file);
      const uploadDetails = await getUploadURLsAndUploadID(objectname, partsAndIndex.maxPartNumber);
      const eTags = await uploadFileParts(partsAndIndex.chunks, uploadDetails, file, onProgress);//上传分片
      const ok = await completeMultipartUpload(objectname, uploadDetails.uploadID, partsAndIndex.maxPartNumber, eTags);//通知合并分片
      if (ok === true) {
        onSuccess("Large file uploaded successfully.", file);
      } else {
        onError("Large file uploaded complete Multipart faild", file);
      }

    } else {
      // console.log("small");
      // 小文件直接上传
      const simpleUploadUrl = await getUploadURL(objectname)
      const ok = await singleFileUpload(simpleUploadUrl, file, onProgress);
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



// 辅助函数定义（请根据实际情况实现）
async function getUploadURL(objectname) {
  try {
    const raw = JSON.stringify({
      "bucketname": userInfo.value.bucketname,
      "objectname": objectname,
    });
    // 使用JSON传递数据
    const response = await axios.post(ENDPOINTS.s3.upload.smallFile, raw, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json"
      }
    });
    return response.data.data.uploadUrl
  } catch (error) {
    console.error('An error occurred during get uploadUrl:', error);
  }
}
async function getUploadURLsAndUploadID(objectname, maxPartNumber) {

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
    // console.log(response)
    return response.data.data
  } catch (error) {
    console.error('An error occurred during get filelist:', error);
  }
}


async function uploadFileParts(chunks, uploadDetails, currentFile, onProgress) {
  let eTags = [];
  let uploadedChunks = 0; // 已上传的分片数
  for (let i = 0; i < chunks.length; i++) {
    const url = uploadDetails.presignedURLs[i];
    const chunk = chunks[i];
    try {
      // 使用JSON传递数据
      const response = await axios.put(url, chunk);
      eTags.push(response.headers.etag); // 收集每个分块的ETag
      uploadedChunks++; // 增加已上传的分片数

      // 更新进度
      const percent = Math.round((uploadedChunks / chunks.length) * 100);
      onProgress({percent: percent}, currentFile);
    } catch (error) {
      console.error('An error occurred during upload:', error);
    }
  }

  return eTags
}

async function completeMultipartUpload(objectname, uploadID, maxPartNumber, eTags) {
  try {
    const raw = JSON.stringify({
      "bucketname": userInfo.value.bucketname,
      "objectname": objectname,
      "uploadID": uploadID,
      "maxPartNumber": maxPartNumber,
      "eTags": eTags,
    });
    // console.log(raw);

    const response = await axios.post(ENDPOINTS.s3.upload.bigFile.finish, raw, {
      withCredentials: true,
    });
    if (response.status !== 200) {
      return false
    }
    return true
  } catch (error) {
    console.error('An error occurred during upload:', error);
    return false
  }
}
async function singleFileUpload(url, file, onProgress) {
  try {
    // 使用JSON传递数据
    const response = await axios.put(url, file, {
      headers: {
        "Content-Type": file.type,
      },
      onUploadProgress: (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress({percent: percent}, file);
      },
    });
    // console.log(file.percent)
    if (response.status === 200){
      return true
    }
    // console.log(response);
  } catch (error) {
    console.error('An error occurred during upload:', error);
    return false
  }
}
async function cutAndIndexFile(file) {

  const chunks = [];
  let start = 0;
  const fileSize = file.size;
  // const partNumberArr = []; // 索引数组，将从1开始计数

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
  // console.log(chunks)
  const maxPartNumber = chunks.length
  // 返回分片数组及其下标数组
  return { chunks, maxPartNumber };
}
</script>