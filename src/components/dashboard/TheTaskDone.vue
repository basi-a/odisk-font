<template>
    <div :style="{ padding: '2px'}">
        <a-breadcrumb>
            <a-breadcrumb-item><a href="/dashboard">首页</a></a-breadcrumb-item>
            <a-breadcrumb-item>任务管理</a-breadcrumb-item>
            <a-breadcrumb-item>已完成</a-breadcrumb-item>
        </a-breadcrumb>
    </div>


    <div :style="{ padding: '24px', background: '#fff', minHeight: '93vh' }">
        <div v-if=taskdone>
            好耶干完了
        </div>
        <div v-else>
            <component :is=TheEmpty></component>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import TheEmpty from "../TheEmpty.vue"
const taskdone = ref(null);

</script>

<style></style>
