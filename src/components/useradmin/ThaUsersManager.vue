<template>
    <div :style="{ padding: '2px' }">
        <a-breadcrumb>
            <a-breadcrumb-item><a href="/dashboard">首页</a></a-breadcrumb-item>
            <a-breadcrumb-item>用户管理</a-breadcrumb-item>
        </a-breadcrumb>
    </div>

    <div :style="{ padding: '24px', background: '#fff', minHeight: '93vh' }">

        <component :is=TheUsersList></component>

    </div>
</template>

<script setup>
import TheUsersList from "./TheUsersList.vue";

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