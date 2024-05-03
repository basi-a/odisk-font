<template>

    <h1>创建文件夹</h1>
    <a-input-group compact>
        <a-input v-model:value="dirname" placeholder="请输入文件夹路径, 例如: `scripts/bash/`" style="width: 85%;" />
        <a-button type="primary" @click="mkdir" style="width: 15%;">创建</a-button>
    </a-input-group>


    <h1>文件夹目录输入规则:</h1>
    <p>从根目录下的顶级文件夹开始，一层一层书写,</p>
    <p>以 `/` 结尾，例如：`scripts/bash/`</p>


</template>
<script setup>
import { ENDPOINTS } from "@/api.config.js";
import Swal from 'sweetalert2';
import axios from 'axios';
import { ref } from "vue";
const dirname = ref("");

const userInfo = JSON.parse(localStorage.getItem("userInfo"));
const mkdir = async () => {
    dirname.value = dirname.value.trim();
    try {
        const raw = JSON.stringify({
            "bucketname": userInfo.bucketname,
            "dirname": dirname.value,
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