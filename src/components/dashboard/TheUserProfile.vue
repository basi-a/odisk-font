<template>
    <div :style="{ padding: '2px' }">
        <a-breadcrumb>
            <a-breadcrumb-item><a href="/dashboard">首页</a></a-breadcrumb-item>
            <a-breadcrumb-item>个人中心</a-breadcrumb-item>
        </a-breadcrumb>
    </div>


    <div v-if=userInfo :style="{ padding: '24px', background: '#fff', minHeight: '91vh' }">

        <a-descriptions title="用户信息" bordered>
            <a-descriptions-item label="用户名称:">
                <span> {{ userInfo.username }}</span>
            </a-descriptions-item>
            <a-descriptions-item label="邮箱:">
                <span> {{ userInfo.email }}</span>
            </a-descriptions-item>

            <a-descriptions-item label="用户类型:">
                <span> {{ userInfo.permission }}</span>
            </a-descriptions-item>
            <a-descriptions-item label="存储桶:">
                <span> {{ userInfo.bucketname }}</span>
            </a-descriptions-item>
            <a-descriptions-item label="注册时间:">
                <span>{{ userInfo.registrationtime }}</span>
            </a-descriptions-item>

        </a-descriptions>
  
        <a-descriptions title="更新信息" />
    </div>

</template>

<script setup>

// 创建一个响应式的ref对象来存储userInfo数据
const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));


</script>

<style></style>