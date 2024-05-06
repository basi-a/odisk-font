<template>
    <div :style="{ padding: '2px' }">
        <a-breadcrumb>
            <a-breadcrumb-item><a href="/dashboard">首页</a></a-breadcrumb-item>
            <a-breadcrumb-item>用户管理</a-breadcrumb-item>
        </a-breadcrumb>
    </div>

    <div :style="{ padding: '24px', background: '#fff', minHeight: '93vh' }">
        
        <!-- <a-float-button shape="circle" @click="showMkdirCard = true" :style="{ right: '80px', bottom: '150px', }">
            <template #icon>
                <FolderAddOutlined />
            </template>
        </a-float-button>
        <a-float-button shape="circle" @click="showFileUploadCard = true" :style="{ right: '80px', bottom: '80px', }">
            <template #icon>
                <CloudUploadOutlined />
            </template>
        </a-float-button>

        <a-card v-if="showFileUploadCard || showMkdirCard"
            style="width: 500px; max-width: calc(100% - 160px); position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1000;">
            <div v-if="showFileUploadCard">
                <component :is=TheFileUpload></component>
            </div>
            <div v-if="showMkdirCard">
                <component :is=TheMkdir></component>
            </div>
        </a-card>

        Add a transparent overlay to capture clicks outside the card -->
        <!-- <div v-if="showFileUploadCard || showMkdirCard" class="overlay" @click="hideCard" /> -->

        <component :is=TheUsersList></component>


    </div>
</template>

<script setup>
import TheUsersList from "./TheUsersList.vue";
import { ref } from 'vue';
import {
    FolderAddOutlined,
    CloudUploadOutlined,
} from '@ant-design/icons-vue';
// const showFileUploadCard = ref(false);
// const showMkdirCard = ref(false);

// function hideCard() {
//     showFileUploadCard.value = false;
//     showMkdirCard.value = false;
// }
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