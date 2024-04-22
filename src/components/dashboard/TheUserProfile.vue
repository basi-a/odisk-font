<template>
    <div :style="{ padding: '2px' }">
        <a-breadcrumb>
            <a-breadcrumb-item><a href="/dashboard">首页</a></a-breadcrumb-item>
            <a-breadcrumb-item>个人中心</a-breadcrumb-item>
        </a-breadcrumb>
    </div>


    <div v-if=userinfo :style="{ padding: '24px', background: '#fff', minHeight: '91vh' }">

        <a-descriptions title="用户信息" bordered>
            <a-descriptions-item label="用户名称:">
                <span> {{ userinfo.username }}</span>
            </a-descriptions-item>
            <a-descriptions-item label="邮箱:">
                <span> {{ userinfo.email }}</span>
            </a-descriptions-item>

            <a-descriptions-item label="用户类型:">
                <span> {{ userinfo.permission }}</span>
            </a-descriptions-item>
            <a-descriptions-item label="存储桶:">
                <span> {{ userinfo.bucketname }}</span>
            </a-descriptions-item>
            <a-descriptions-item label="注册时间:">
                <span>{{ userinfo.registrationtime }}</span>
            </a-descriptions-item>

        </a-descriptions>
        <br />
        <a-descriptions title="更新信息" />
    </div>

</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { ENDPOINTS } from '@/api.config.js';
// 创建一个响应式的ref对象来存储userinfo数据
const userinfo = ref(null);

async function fetchUserInfo() {
    try {
        console.log('Sending GET request to /v1/userinfo...');
        const response = await axios.get(ENDPOINTS.getUserInfo, {
            withCredentials: true,
        });

        console.log('Received response:', response.data);
        // 将API响应中的data赋值给userinfo
        userinfo.value = response.data.data[0];

        console.log('Userinfo has been assigned:', userinfo.value);
    } catch (error) {
        console.error('Failed to fetch user info:', error);
        // 可以根据需要处理错误情况，如显示错误提示等
    }
}

// 在组件挂载后立即触发fetchUserInfo函数
fetchUserInfo();

</script>

<style></style>