<template>
    <div class="full-screen-background">
        <div class="forget-container">
            <a-card title="忘记密码" :bordered="false" class="antd-card">

                <a-form :model="formState" name="normal_login" class="login-form" @finish="onFinish"
                    @finishFailed="onFinishFailed">

                    <a-form-item label="邮箱" name="email"
                        :rules="[{ required: true, message: 'Please input your email!' }]">
                        <div style="display: flex; align-items: center;margin-left: 28px;">
                            <a-input v-model:value="formState.email">
                                <template #prefix>
                                    <MailOutlined class="site-form-item-icon" />
                                </template>
                            </a-input>
                        </div>
                    </a-form-item>
                    <a-form-item label="验证码" name="code"
                        :rules="[{ required: true, message: 'Please input your verification code!' }]">
                        <div style="display: flex; align-items: center;margin-left: 14px;">
                            <a-input v-model:value="formState.code"></a-input>
                            <a-button @click="sendMail" :disabled="sendingDisabled || !formState.email"
                                style="margin-left: 8px;">
                                {{ sendingDisabled ? `重新发送(${countdown}s)` : '获取验证码' }}
                            </a-button>
                        </div>
                    </a-form-item>
                    <a-form-item label="新的密码" name="password"
                        :rules="[{ required: true, message: 'Please input your password!' }]">
                        <div style="display: flex; align-items: center;margin-left: 0px;">
                            <a-input-password v-model:value="formState.password">
                                <template #prefix>
                                    <LockOutlined class="site-form-item-icon" />
                                </template>
                            </a-input-password>
                        </div>
                    </a-form-item>

                    <a-form-item>
                        <a-button :disabled="disabled" type="primary" html-type="submit" class="reset-form-button">
                            重置密码
                        </a-button>
                    </a-form-item>
                    <a-form-item>
                        <a class="login-link" href="/login">想起来了, 去登陆🚀</a>
                    </a-form-item>
                </a-form>
            </a-card>
        </div>

    </div>
</template>
<script setup>
import { reactive, computed, ref } from 'vue';
import { MailOutlined, LockOutlined } from '@ant-design/icons-vue';
import axios from 'axios';
import { ENDPOINTS } from '@/api.config.js';
import router from '@/router'
import Swal from 'sweetalert2';
const formState = reactive({
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
        data.append('email', formState.email)

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

// 重置密码处理函数  
const onFinish = async () => {
    try {
        // const data = new FormData();
        // data.append('email', formState.email);
        // data.append('password', formState.password);
        // data.append('code', formState.code)
        const data = JSON.stringify(formState)
        const response = await axios.post(ENDPOINTS.forget, data, {
            withCredentials: true, // 允许跨站点访问控制（CORS）携带 cookie  
            // headers: {
            //     'Content-Type': 'multipart/form-data', // 设置正确的 Content-Type  
            // },
        });

        if (response.status === 200) {

            console.log('regeister successful:', response.data);
            // 使用 sweetalert2 显示重置密码成功的弹窗  
            Swal.fire({
                icon: 'success',
                title: '重置密码成功',
                text: '你已经成功重置密码!',
                showConfirmButton: false,
                timer: 1500
            });
            //   重定向到 /dashboard 页面  
            router.push('/login');
        } else {
            // 处理登录失败的情况  
            console.log('regeister failed:', response.data);
            // 使用 sweetalert2 显示重置密码失败的弹窗  
            Swal.fire({
                icon: 'error',
                title: '重置密码失败',
                text: '重置密码过程中出现问题!',
                showConfirmButton: false,
                timer: 1500
            });
        }
    } catch (error) {
        // 处理请求错误  
        console.error('An error occurred during regeister:', error);
        // 使用 sweetalert2 显示错误的弹窗  
        Swal.fire({
            icon: 'error',
            title: '发生错误',
            text: '重置密码请求出错!',
            showConfirmButton: false,
            timer: 1500
        });
    }
};
const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
};
const disabled = computed(() => {
    return !(formState.email && formState.password && formState.code);
});
</script>
<style scoped>
.full-screen-background {
    /* 设置背景图像 */
    background-image: linear-gradient(120deg, #a6c0fe 0%, #f68084 100%);
    /* background-image: url(https://cdn.basi-a.top/images/images_tree.webp); */
    background-size: cover;
    /* 背景图像覆盖整个容器 */
    background-position: center;
    background-repeat: no-repeat;
    /* 图片不重复 */
    /* 背景图像居中 */
    height: 100vh;
    /* 容器高度占满视口高度 */
    width: 100vw;
    /* 容器宽度占满视口宽度 */
    display: flex;
    justify-content: center;
    /* 水平居中 */
    align-items: center;
    /* 垂直居中 */
    overflow: hidden;
    /* 隐藏超出容器的背景图像部分 */
}

.forget-container {
    /* 移除不必要的样式 */
    display: flex;
    flex-direction: column;
    /* 使用列方向布局 */
    align-items: center;
    /* 子元素在交叉轴（这里是垂直方向）上居中 */
    /* justify-content: center; */
    justify-content: space-between;
    /* 调整登录和重置密码按钮的位置 */
    text-align: center;
    /* 文本居中 */
    /* 根据需要调整以下尺寸 */
    width: 100%;
    /* 确保容器宽度占满父容器 */
    max-width: 400px;
    /* 限制最大宽度，使登录表单不会过于宽大 */
    transform: scale(2);
}

.antd-card {
    width: 100%;
}

.login-form {
    width: 100%;
}


.reset-form-button {
    width: 100%;
    display: flex;
    justify-content: center;
}

.login-link {
    float: left;
}
</style>