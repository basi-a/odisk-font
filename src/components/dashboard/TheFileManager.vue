<template>
    <div :style="{ padding: '2px' }">
        <a-breadcrumb>
            <a-breadcrumb-item><a href="/dashboard">首页</a></a-breadcrumb-item>
            <a-breadcrumb-item>文件管理</a-breadcrumb-item>
        </a-breadcrumb>
    </div>

    <div :style="{ padding: '24px', background: '#fff', minHeight: '93vh' }">

        <a-float-button shape="circle" type="primary" @click="showFileUploadCard = true"
            :style="{ right: '80px', bottom: '80px', }">
            <template #icon>
                <CloudUploadOutlined />
            </template>
        </a-float-button>

        <a-card v-if="showFileUploadCard"
            style="width: 500px; max-width: calc(100% - 160px); position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1000;">
            <!-- <TheFileUpload @upload-complete="hideFileUploadCard" /> -->
            <component :is=TheFileUpload></component>
        </a-card>

        <!-- Add a transparent overlay to capture clicks outside the card -->
        <div v-if="showFileUploadCard" class="overlay" @click="hideFileUploadCard" />



        <component :is=TheFileList></component>


    </div>
</template>

<script setup>
import TheFileUpload from "./TheFileUpload.vue";
import TheFileList from "./TheFileList.vue";

import { ref } from 'vue';
import {
    CloudUploadOutlined,
} from '@ant-design/icons-vue';
const showFileUploadCard = ref(false);


function hideFileUploadCard() {
    showFileUploadCard.value = false;
}
</script>

<style scoped>
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