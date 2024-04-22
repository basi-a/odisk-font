<template>
    <a-upload-dragger
      v-model:fileList="fileList"
      name="file"
      :multiple="true"
      action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
      @change="handleChange"
      @drop="handleDrop"
    >
      <p class="ant-upload-drag-icon">
        <InboxOutlined/>
      </p>
      <p class="ant-upload-text">点击或拖拽文件至此区域即可上传</p>
      <p class="ant-upload-hint">
        支持单次或批量上传, 严禁上传敏感文件或数据！！！
      </p>
    </a-upload-dragger>
  </template>
  <script setup>
  import { ref } from 'vue';
  import { message } from 'ant-design-vue';
  import {
    InboxOutlined,
} from '@ant-design/icons-vue';
  const fileList = ref([]);
  const handleChange = info => {
    const status = info.file.status;
    if (status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    if (status === 'done') {
      message.success(`${info.file.name} file uploaded successfully.`);
    } else if (status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  };
  function handleDrop(e) {
    console.log(e);
  }
  </script>