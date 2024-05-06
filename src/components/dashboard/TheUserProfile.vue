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
        <a-button @click="drawerOpen = true" style="margin-top: 2%;" size="large">
            更新信息
        </a-button>
        <a-drawer v-model:open="drawerOpen" class="custom-class" root-class-name="root-class-name" :width="'20%'"
            placement="right">
            <a-form :model="formState" name="normal_login" class="login-form" @finish="onFinish"
                @finishFailed="onFinishFailed">
                <a-form-item label="昵称" name="username"
                    :rules="[{ required: false, message: 'Please input your username!' }]">
                    <a-input v-model:value="formState.username">
                        <template #prefix>
                            <UserOutlined class="site-form-item-icon" />
                        </template>
                    </a-input>
                </a-form-item>

                <a-form-item label="邮箱" name="email" :rules="[{ required: false, message: 'Please input your email!' }]">
                    <a-input v-model:value="formState.email">
                        <template #prefix>
                            <MailOutlined class="site-form-item-icon" />
                        </template>
                    </a-input>
                </a-form-item>

                <a-form-item label="密码" name="password"
                    :rules="[{ required: false, message: 'Please input your password!' }]">
                    <a-input-password v-model:value="formState.password">
                        <template #prefix>
                            <LockOutlined class="site-form-item-icon" />
                        </template>
                    </a-input-password>
                </a-form-item>
                <a-form-item label="验证码" name="code"
                    :rules="[{ required: true, message: 'Please input your verification code!' }]">
                    <div style="display: flex; align-items: center;">
                        <a-input v-model:value="formState.code"></a-input>
                        <a-button @click="sendMail" :disabled="sendingDisabled || !formState.email"
                            style="margin-left: 10px;">
                            {{ sendingDisabled ? `重新发送(${countdown}s)` : '获取验证码' }}
                        </a-button>
                    </div>
                </a-form-item>
                <a-form-item>
                    <a-button :disabled="disabled" type="primary" html-type="submit">
                        <span>更新</span>
                    </a-button>
                </a-form-item>

            </a-form>
        </a-drawer>
    </div>

</template>

<script setup>
import { reactive, computed, ref } from 'vue';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons-vue';
import axios from 'axios';
import { ENDPOINTS } from '@/api.config.js';
import Swal from 'sweetalert2';

const drawerOpen = ref(false);
// 创建一个响应式的ref对象来存储userInfo数据
const userInfo = ref(JSON.parse(localStorage.getItem('userInfo')));
const emit = defineEmits(['updateUserInfo']); // 定义自定义事件名称
const formState = reactive({
    username: '',
    email: '',
    password: '',
    code: '',
});
const sendingDisabled = ref(false);
const countdown = ref(0);
// 发送邮件函数
const sendMail = async () => {
    if (sendingDisabled.value) return; // 如果按钮处于禁用状态，则直接返回
    sendingDisabled.value = true; // 禁用按钮
    countdown.value = 10; // 开始倒计时

    // 倒计时逻辑
    const intervalId = setInterval(() => {
        countdown.value -= 1;
        if (countdown.value <= 0) {
            clearInterval(intervalId);
            sendingDisabled.value = false; // 倒计时结束，重新启用按钮
        }
    }, 1000);
    try {
        const data = new FormData();
        data.append('email', userInfo.value.email)
        const response = await axios.post(ENDPOINTS.sendMailVerification, data, {
            withCredentials: true, // 允许跨站点访问控制（CORS）携带 cookie  
            headers: {
                'Content-Type': 'multipart/form-data', // 设置正确的 Content-Type  
            },
        });
        if (response.status === 200) {
            console.log('send mail to get code successful', response.data)
        } else {
            console.log('send mail to get code fail', response.data)
        }
    } catch (error) {
        console.log('An error occurred during send mail', error)
    }
}
const onFinish = async () => {
    try {
        const raw = JSON.stringify({
            "username": formState.username,
            "email": userInfo.value.email,
            "newemail": formState.email,
            "password": formState.password,
            "code": formState.code
        });
        const response = await axios.post(ENDPOINTS.users.updete, raw, {
            withCredentials: true,
        });

        if (response.status === 200) {

            Swal.fire({
                icon: 'success',
                title: '更新成功',
                showConfirmButton: false,
                timer: 1500
            });

        } else {

            Swal.fire({
                icon: 'error',
                title: '更新失败',
                text: '更新过程中出现问题!',
                showConfirmButton: false,
                timer: 1500
            });
        }
    } catch (error) {
        // 处理请求错误  
        console.error('An error occurred during register:', error);
        // 使用 sweetalert2 显示错误的弹窗  
        Swal.fire({
            icon: 'error',
            title: '更新失败',
            text: '更新过程中出现问题!',
            showConfirmButton: false,
            timer: 1500
        });
    }
    if (formState.password !== "") {
        document.cookie = `session_id=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
        localStorage.removeItem('userInfo')
        sessionStorage.removeItem("currentPrefix");
        router.push('/login');
    } else {
        try {
            const response = await axios.get(ENDPOINTS.getUserInfo, {
                withCredentials: true,
            });
            userInfo.value = response.data.data;
            localStorage.setItem('userInfo', JSON.stringify(userInfo.value));
            emit('updateUserInfo', userInfo.value);
        } catch (error) {
            console.log(error)
        }
    }
};



const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
};
const disabled = computed(() => {
    return !(formState.email && formState.code);
});
</script>

<style></style>