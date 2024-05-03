<template>

    <h1>创建文件夹</h1>
    
    <span>当前: /{{currentPrefix}}</span>
    <a-input-group compact style="margin-top: 2%;">
        <a-input v-model:value="dirname" placeholder="请输入目录, 例如: `scripts/bash/`" style="width: 85%;" />
        <a-button type="primary" @click="mkdir" style="width: 15%;">创建</a-button>
    </a-input-group>
    <p style="margin-top: 2%;">tip: 当从`/`开始写时, 会从根目录开始创建</p>
</template>
<script setup>
import { ENDPOINTS } from "@/api.config.js";
import Swal from 'sweetalert2';
import axios from 'axios';
import { ref } from "vue";
const dirname = ref("");
const currentPrefix = sessionStorage.getItem("currentPrefix");
const userInfo = JSON.parse(localStorage.getItem("userInfo"));
const mkdir = async () => {
    dirname.value = dirname.value.trim();
    const fullPath = ref("");
    if (dirname.value.startsWith('/')){
        fullPath.value = dirname.value.slice(1);;
    }else{
        fullPath.value = currentPrefix+dirname.value;
    };
    try {
        const raw = JSON.stringify({
            "bucketname": userInfo.bucketname,
            "dirname": fullPath.value,
        });
        const response = await axios.post(ENDPOINTS.s3.mkdir, raw, {
            withCredentials: true,
        });
        if (response.status === 200) {
            Swal.fire({
                icon: 'success',
                title: '创建成功',
                text: '文件夹创建成功！！',
                showConfirmButton: false,
                timer: 1500
            });
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: '创建失败',
            text: '文件夹创建失败！！',
            showConfirmButton: false,
            timer: 1500
        });
        console.error('An error occurred while mkdir:', error);
    }
}

</script>

<style></style>