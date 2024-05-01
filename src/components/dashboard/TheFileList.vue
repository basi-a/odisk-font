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
    <a-table class="ant-table-striped" :columns="columns" :data-source="fileList" :scroll="{ x: 400, y: 900 }"
      :row-class-name="(_record, index) => (index % 2 === 1 ? 'table-striped' : null)" bordered>
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'name'">
          <template v-if="column.dataIndex === 'name'">
            <img :src="getIcon(record.contenttype)" class="file-icon" />
            <a v-if="record.contenttype !== 'directory'" @click="showDrawer(record)">{{ record[column.dataIndex]
              }}</a>
            <span v-else @click="handleRowClick(record)"><a>{{ record[column.dataIndex] }}</a></span>
          </template>
        </template>
      </template>
    </a-table>
    <a-drawer v-model:open="drawerOpen" class="custom-class" root-class-name="root-class-name" :width="'20%'"
      placement="right">
      <div v-if=selectedRecord>

        <a-descriptions title="文件详情" layout="vertical" bordered>
          <a-descriptions-item label="文件名">{{ selectedRecord.name }}</a-descriptions-item>
          <a-descriptions-item label="文件类型">{{ selectedRecord.contenttype }}</a-descriptions-item>
          <a-descriptions-item label="文件大小">{{ selectedRecord.size }}</a-descriptions-item>
          <a-descriptions-item label="上一次更改">{{ selectedRecord.lastModified }}</a-descriptions-item>
        </a-descriptions>
        <br />

        <a-descriptions title="文件操作" layout="vertical"></a-descriptions>
        <div style="display: flex; align-items: center;">
          <a-button style="width: 46%;margin-right: 2%;margin-left: 2%;">下载</a-button>
          <a-button style="width: 46%;margin-right: 2%;margin-left: 2%;">分享</a-button>
          
        </div>
        <div style="display: flex; align-items: center;">
          <a-button style="width: 46%;margin-right: 2%;margin-left: 2%;">重命名</a-button>
          <a-button style="width: 46%;margin-right: 2%;margin-left: 2%;">移动</a-button>
        </div>
        
      </div>
      <div v-else>
        <TheEmpty />
      </div>
    </a-drawer>
  </div>

  <div v-else>
    <TheEmpty />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import TheEmpty from "../TheEmpty.vue";

import axios from 'axios';
import { ENDPOINTS } from '@/api.config.js';

const drawerOpen = ref(false);
const selectedRecord = ref(null);
const showDrawer = (record) => {
  selectedRecord.value = record;
  drawerOpen.value = true;
};

const getIcon = (contentType) => {
  return fileTypeIcons[contentType] || fileTypeIcons['default'];
};
const userInfo = JSON.parse(localStorage.getItem('userInfo'));
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
    getFileList();
  } else {
    showDrawer(record);
  }
};


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
  getFileList();
};

const handleBucketnameClick = () => {
  prefix.value = "";
  getFileList();
}

// 更改变量名以保持一致性
const fileList = ref(null);
const prefix = ref("");

async function getFileList() {
  try {
    const raw = JSON.stringify({
      "bucketname": userInfo.bucketname,
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

  } catch (error) {
    console.error('An error occurred during get filelist:', error);
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
</style>