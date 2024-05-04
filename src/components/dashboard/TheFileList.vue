<template>
  <div v-if="fileList">

    <a-breadcrumb>
      <a-breadcrumb-item>
        <a @click="handleBucketnameClick">{{ userInfo.bucketname }}</a>
      </a-breadcrumb-item>

      <a-breadcrumb-item v-for="(item, index) in prefixSegments" :key="index">
        <a v-if="index !== prefixSegments.length - 1" @click="handleBreadcrumbClick(item.path)">{{ item.name }}</a>
        <span v-else>{{ item.name }}</span>
      </a-breadcrumb-item>
    </a-breadcrumb>


    <br />
    <a-table class="ant-table-striped" :columns="columns" :data-source="fileList" :scroll="{ x: 400, y: 900 }" :pagination="pagination"
      :row-class-name="(_record, index) => (index % 2 === 1 ? 'table-striped' : null)" bordered>
      <template #bodyCell="{ column, record }">
        <!-- <template v-if="column.dataIndex === 'name'"> -->
          <template v-if="column.dataIndex === 'name'">
            <img :src="getIcon(record.contenttype)" class="file-icon" />
            <a v-if="record.contenttype !== 'directory'" @click="showDrawer(record)">{{ record[column.dataIndex]
              }}</a>
            <span v-else @click="handleRowClick(record)"><a>{{ record[column.dataIndex] }}</a></span>
          </template>
        <!-- </template> -->
      </template>
    </a-table>
    <a-drawer v-model:open="drawerOpen" class="custom-class" root-class-name="root-class-name" :width="'30%'"
      placement="right">
      <div v-if=selectedRecord>

        <a-descriptions title="文件详情" layout="vertical" bordered>
          <a-descriptions-item label="文件对象名">{{ selectedRecord.name }}</a-descriptions-item>
          <a-descriptions-item label="所属目录">{{ selectedRecord.prefix }}</a-descriptions-item>
          <a-descriptions-item label="文件类型">{{ selectedRecord.contenttype }}</a-descriptions-item>
          <a-descriptions-item label="文件大小">{{ selectedRecord.size }}</a-descriptions-item>
          <a-descriptions-item label="上一次更改">{{ selectedRecord.lastModified }}</a-descriptions-item>
        </a-descriptions>
        <br />

        <a-descriptions title="文件操作" layout="vertical"></a-descriptions>
        <div style="display: flex; align-items: center;">
          <a-button class="file-operation-buttons" @click="Download">下载</a-button>
          <a-button class="file-operation-buttons" @click="handleShareClick">分享</a-button>

        </div>
        <div style="display: flex; align-items: center;">
          <a-button class="file-operation-buttons" @click="showRenameCard = true;">重命名</a-button>
          <a-button class="file-operation-buttons" @click="showMVCard = true;">移动</a-button>
        </div>
        <div style="display: flex; align-items: center;">
          <a-popconfirm title="你确定要删除这个文件？" ok-text="Yes" cancel-text="No" @confirm="confirm" @cancel="cancel">
            <a-button class="file-operation-buttons">删除</a-button>
          </a-popconfirm>
        </div>

      </div>
      <div v-else>
        <TheEmpty />
      </div>
      <a-card v-if="showShareCard || showMVCard || showRenameCard"
        style="width: 500px; max-width: calc(100% - 160px); position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1000;">
        <div v-if="showShareCard">
          <h3>分享文件</h3>
          <a-space style="margin-left: 3%;">
            <a-input-number v-model:value="days" :min="0" :max="30" />days
            <a-input-number v-model:value="hours" :min="1" :max="12" />hours
            <a-input-number v-model:value="minutes" :min="0" :max="60" />minutes
          </a-space>

          <a-input-group v-if="sharedUrl" style="margin-left: 2%;margin-top: 5%;" compact>
            <a-input type="text" :value="sharedUrl" readonly style="width: 90%"></a-input>
            <a-button style="width: 10%;" @click="copyToClipboard(sharedUrl)">
              <template #icon>
                <CopyOutlined />
              </template>
            </a-button>
          </a-input-group>

          <div v-else style="text-align: center; margin-top: 16px;">
            设置过期时间后点击确定分享以生成链接
          </div>
        </div>
        <div v-else-if="showMVCard">
          <h3>移动</h3>
          <a-input-group compact>
            <a-input type="text" v-model:value="destPrefix" placeholder="请输入文件夹路径, 例如: `scripts/bash/`"
              style="width: 85%;" />
            <a-button @click="movefile" style="width: 15%;">
              <template #icon>
                <SendOutlined />
              </template>
            </a-button>
          </a-input-group>
          <p>当路径为空或"/"时, 则会移动到根目录</p>
        </div>
        <div v-else-if="showRenameCard">
          <h3>重命名</h3>
          <a-input-group compact>
            <a-input type="text" v-model:value="newName" placeholder="请输入新的文件名, 例如: `Apifox.appimage`"
              style="width: 85%;" />
            <a-button @click="renamefile" style="width: 15%;">
              <template #icon>
                <EditOutlined />
              </template>
            </a-button>
          </a-input-group>
        </div>
      </a-card>
      <div v-if="showShareCard || showMVCard || showRenameCard" class="overlay" @click="hideCard" />

    </a-drawer>
  </div>

  <div v-else>
    <TheEmpty />
  </div>
  <a-float-button shape="circle" @click="handleRefresh" :style="{ right: '80px', bottom: '220px', }">
    <template #icon>
      <ReloadOutlined />
    </template>
  </a-float-button>
</template>

<script setup>
import { ref, computed,reactive } from "vue";

import TheEmpty from "../TheEmpty.vue";
import {
  CopyOutlined,
  ReloadOutlined,
  EditOutlined,
  SendOutlined
} from '@ant-design/icons-vue';
import axios from 'axios';
import { ENDPOINTS } from '@/api.config.js';
import Swal from 'sweetalert2';
const drawerOpen = ref(false);
const selectedRecord = ref(null);
const showDrawer = (record) => {
  selectedRecord.value = record;
  drawerOpen.value = true;
};

const showShareCard = ref(false);
const showMVCard = ref(false);
const showRenameCard = ref(false);
const hideCard = () => {
  showShareCard.value = false;
  showMVCard.value = false;
  showRenameCard.value = false;
};

const getIcon = (contentType) => {
  return fileTypeIcons[contentType] || fileTypeIcons['default'];
};
const userInfo = ref(JSON.parse(localStorage.getItem('userInfo')));

const fileTypeIcons = {
  'directory': '/icons/folder.svg',
  'image/png': '/icons/image.svg', // PNG图片图标
  'image/jpeg': '/icons/image.svg', // JPEG图片图标
  'application/x-xz': '/icons/x.svg',
  // 添加其他文件类型的图标映射
  'default': '/icons/unknown.svg' // 添加一个默认图标
};
const handleRowClick = (record) => {
  if (record.contenttype === 'directory') {
    // 更新前缀以包含当前文件夹路径
    prefix.value = record.prefix || record.name;
    // 重新获取子文件列表
    sessionStorage.setItem("currentPrefix", prefix.value);
    getFileList();
  } else {
    showDrawer(record);
  }
};


import { message } from 'ant-design-vue';
const confirm = async e => {
  console.log(e);
  message.success('Click on Yes');
  const status = await delateFile();
  if (status === 200) {
    Swal.fire({
      icon: 'success',
      title: '删除成功',
      showConfirmButton: false,
      timer: 1500,
    });
  } else {
    Swal.fire({
      icon: 'error',
      title: '复制失败',
      showConfirmButton: false,
      timer: 1500,
    });
  }
};
const cancel = e => {
  console.log(e);
  message.error('Click on No');
};

async function delateFile() {
  try {
    const raw = JSON.stringify({
      "objectname": selectedRecord.value.objectname,
      "bucketname": userInfo.value.bucketname,
    });

    const response = await axios.delete(ENDPOINTS.s3.delatefile, {
      withCredentials: true,
      data: raw,
    });
    getFileList();
    return response.status

  } catch (error) {
    console.log("删除文件失败", error)

  }
}




const days = ref(0);
const hours = ref(12);
const minutes = ref(0);
async function Share(days, hours, minutes) {

  const downloadExpiry = days * 24 * 60 * 60 * 60 + hours * 60 * 60 + minutes * 60
  try {
    const raw = JSON.stringify({
      "objectname": selectedRecord.value.objectname,
      "bucketname": userInfo.value.bucketname,
      "downloadExpiry": downloadExpiry,
    });
    const response = await axios.post(ENDPOINTS.s3.getDownloadUrl, raw, {
      withCredentials: true,
    });

    // console.log(response.data.data.downloadUrl);
    return response.data.data.downloadUrl;
  } catch (error) {
    console.error("获取文件下载连接失败:", error);
  }

}
// 添加这个函数用于复制文本到剪贴板
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    Swal.fire({
      icon: 'success',
      title: '已复制',
      text: '分享链接已复制到剪贴板！',
      showConfirmButton: false,
      timer: 1500,
    });
  }, () => {
    Swal.fire({
      icon: 'error',
      title: '复制失败',
      text: '复制分享链接到剪贴板时出错，请手动复制。',
      showConfirmButton: true,
    });
  });
};
// 添加响应式变量存储分享链接
const sharedUrl = ref('');

// 调整Download函数，使其在点击分享后才执行Share函数
const handleShareClick = async () => {
  showMVCard.value = false;
  showRenameCard.value = false;
  if (days.value > 0 || hours.value > 0 || minutes.value > 0) {
    const url = await Share(days.value, hours.value, minutes.value);
    sharedUrl.value = url;
    // console.log(url)
    showShareCard.value = true; // 显示分享卡片
  } else {
    Swal.fire({
      icon: 'warning',
      title: '请选择有效时间',
      text: '请至少选择一天、小时或分钟中的一个有效时间。',
      showConfirmButton: true,
    });
  }
}
const Download = async () => {
  try {
    const raw = JSON.stringify({
      "objectname": selectedRecord.value.objectname,
      "bucketname": userInfo.value.bucketname,
    });
    // console.log(raw)
    const response = await axios.post(ENDPOINTS.s3.getDownloadUrl, raw, {
      withCredentials: true,
    });
    // 创建隐藏的a标签并立即触发点击
    const link = document.createElement('a');
    link.href = response.data.data.DownloadUrl;
    link.download = selectedRecord.value.objectname; // 设定下载文件的对象名称
    link.style.display = 'none'; // 隐藏该链接
    document.body.appendChild(link);
    link.click(); // 触发点击事件开始下载

    // 异步等待一段时间以确保下载开始，然后移除链接
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100); // 时间可以根据实际情况调整，这里设置为100毫秒作为示例

    Swal.fire({
      icon: 'success',
      title: '开始下载',
      showConfirmButton: false,
      timer: 1500
    });
  } catch (error) {
    console.error("下载文件时发生错误:", error);
    Swal.fire({
      icon: 'error',
      title: '下载失败',
      text: '文件下载过程中出现问题，请重试。',
      showConfirmButton: false,
      timer: 1500
    });
  }
}

const destPrefix = ref("");
const movefile = async () => {
  // 判断并处理destPrefix
  destPrefix.value = destPrefix.value.trim(); // 先去除前后空白
  if (destPrefix.value === '/' || destPrefix.value === '') {
    destPrefix.value = ''; // 设置为空
  } else if (!destPrefix.value.endsWith('/')) {
    // 确保destPrefix以'/'结尾，如果不包含，则添加
    destPrefix.value += '/';
  }
  try {
    const raw = JSON.stringify({
      "srcbucketname": userInfo.value.bucketname,
      "srcobjectname": userInfo.objectname,
      "destobjectName": destPrefix + selectedRecord.value.name,
    });
    const response = await axios.post(ENDPOINTS.s3.mvOrRename, raw, {
      withCredentials: true,
    });
    if (response.status === 200) {
      Swal.fire({
        icon: 'success',
        title: '移动完成',
        showConfirmButton: false,
        timer: 1500
      });
    }
    getFileList();
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: '移动失败',
      text: '过程中出现问题，请重试。',
      showConfirmButton: false,
      timer: 1500
    });
  }
}
const newName = ref("");
const renamefile = async () => {
  newName.value = destPrefix.value.trim();
  try {
    const raw = JSON.stringify({
      "srcbucketname": userInfo.value.bucketname,
      "srcobjectname": userInfo.objectname,
      "destobjectName": selectedRecord.value.prefix + newName,
    });
    const response = await axios.post(ENDPOINTS.s3.mvOrRename, raw, {
      withCredentials: true,
    });
    if (response.status === 200) {
      Swal.fire({
        icon: 'success',
        title: '重命名完成',
        showConfirmButton: false,
        timer: 1500
      });
    }
    getFileList();
  } catch (error) {
    console.log("重命名失败", error)
    Swal.fire({
      icon: 'error',
      title: '重命名失败',
      text: '过程中出现问题，请重试。',
      showConfirmButton: false,
      timer: 1500
    });
  }
}


const columns = [

  {
    title: 'Name',
    dataIndex: 'name',
    width: 200,

  },
  {
    title: 'Content Type',
    dataIndex: 'contenttype',
    width: 150,
  },
  {
    title: 'Size',
    dataIndex: 'size',
    width: 150,
  },
  {
    title: 'LastModified',
    dataIndex: 'lastModified',
    width: 150,
  },

];

const pagination = reactive({
    // 表格分页的配置
    current: 1,
    pageSize: 10,
    showSizeChanger: true, // 用于控制展示每页多少条的下拉
    // showQuickJumper: true,
    total: 0,
    pageSizeOptions: ['10', '20', '50'],
    showTotal: (total) => `共 ${total} 条`,
    onShowSizeChange: pageSizeChange,
    onChange: pageChange
})
// 页数改变的方法
function pageSizeChange(val, pageNum) {
    pagination.pageSize = pageNum // 修改每页显示的条数
    pagination.current = 1
}
// 点击上一页下一页的方法
function pageChange(page, val) {
    console.log(page, val)
    pagination.current = page
}

// 计算面包屑内容
const prefixSegments = computed(() => {
  const segments = prefix.value.split('/');
  return segments.map((segment, index) => {
    return {
      path: segments.slice(0, index + 1).join('/'),
      name: segment
    };
  });
});

// 处理面包屑点击事件
const handleBreadcrumbClick = (path) => {
  prefix.value = path;
  sessionStorage.setItem("currentPrefix", prefix.value);
  getFileList();
};

const handleBucketnameClick = () => {
  prefix.value = "";
  sessionStorage.setItem("currentPrefix", prefix.value);
  getFileList();
}

// 更改变量名以保持一致性
const fileList = ref(null);
const prefix = ref("");
sessionStorage.setItem("currentPrefix", prefix.value);
async function getFileList() {
  try {
    const raw = JSON.stringify({
      "bucketname": userInfo.value.bucketname,
      "prefix": prefix.value
    });
    // 使用JSON传递数据
    const response = await axios.post(ENDPOINTS.s3.filelist, raw, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json"
      }
    });

    // 赋值给fileList
    fileList.value = response.data.data;
    return response.status
  } catch (error) {
    console.error('An error occurred during get filelist:', error);
  }
}

const handleRefresh = async () => {
  const status = await getFileList();
  if (status === 200) {
    message.success("Refresh Success.");
  }
}

getFileList();
</script>
<style>
/* 在你的 CSS 文件中添加以下样式 */
.file-icon {
  width: 20px;
  height: 20px;
  vertical-align: middle;
  margin-right: 4px;
}

.ant-table-striped .table-striped td {
  background-color: #fafafa;
}

.file-operation-buttons {
  width: 46%;
  margin-right: 2%;
  margin-left: 2%;
  margin-top: 2%;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}
</style>