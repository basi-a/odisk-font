<template>
    <div class="full-screen-background">
        <div class="login-container">
            <a-card title="用户登录" :bordered="false" class="antd-card">

                <a-form :model="formState" name="normal_login" class="login-form" @finish="onFinish"
                    @finishFailed="onFinishFailed">
                    <a-form-item label="邮箱" name="email"
                        :rules="[{ required: true, message: 'Please input your email!' }]">
                        <a-input v-model:value="formState.email">
                            <template #prefix>
                                <MailOutlined class="site-form-item-icon" />
                            </template>
                        </a-input>
                    </a-form-item>

                    <a-form-item label="密码" name="password"
                        :rules="[{ required: true, message: 'Please input your password!' }]">
                        <a-input-password v-model:value="formState.password">
                            <template #prefix>
                                <LockOutlined class="site-form-item-icon" />
                            </template>
                        </a-input-password>
                    </a-form-item>
                    <a-form-item>
                        <a-button :disabled="disabled" type="primary" html-type="submit" class="login-form-button">
                            登录
                        </a-button>
                    </a-form-item>
                    <a-form-item>
                        <a-checkbox v-model:checked="formState.remember" class="remember-me">记住我</a-checkbox>
                        <a class="login-form-forgot" href="/forget">忘记密码🤔</a>
                        <a class="register-link" href="/register">现在注册！！</a>
                    </a-form-item>
                </a-form>
            </a-card>
        </div>

    </div>
</template>

<script setup>
import { reactive, computed } from 'vue';
import { MailOutlined, LockOutlined } from '@ant-design/icons-vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import { ENDPOINTS } from '@/api.config.js';
import router from '@/router'
const formState = reactive({
    email: '',
    password: '',
    remember: true,
});
// 登录处理函数  
const onFinish = async () => {
    try {
        const data = new FormData();
        data.append('email', formState.email);
        data.append('password', formState.password);

        // Perform the login request first
        const loginResponse = await axios.post(ENDPOINTS.login, data, {
            withCredentials: formState.remember.valueOf, // Allow CORS with cookies
            headers: {
                'Content-Type': 'multipart/form-data', // Set correct Content-Type
            },
        });

        if (loginResponse.status === 200) {
            console.log('Login successful:', loginResponse.data);
            Swal.fire({
                icon: 'success',
                title: '登陆成功',
                text: '登陆成功！！',
                showConfirmButton: false,
                timer: 1500
            });
            // Now fetch the user info
            const userInfoResponse = await axios.get(ENDPOINTS.getUserInfo, {
                withCredentials: true,
            });


            if (userInfoResponse.status === 200) {
                const userInfo = userInfoResponse.data.data;
                localStorage.setItem('userInfo', JSON.stringify(userInfo));

                // Perform the redirection based on user role
                if (userInfo.permission === 'userAdmin') {
                    router.push('/userAdmin'); // Redirect to admin dashboard
                } else if (userInfo.permission === 's3Admin') {
                    router.push('/s3Admin'); // Redirect to admin dashboard
                } else {
                    router.push('/dashboard'); // Redirect to user dashboard
                }
            } else {
                console.error('An error occurred while fetching user info:', userInfoResponse.data);
            }
        } else {
            console.log('Login failed:', loginResponse.data);
        }
    } catch (error) {
        console.error('An error occurred during login:', error);
    }
};
const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
};
const disabled = computed(() => {
    return !(formState.email && formState.password);
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

.login-container {
    /* 移除不必要的样式 */
    display: flex;
    flex-direction: column;
    /* 使用列方向布局 */
    align-items: center;
    /* 子元素在交叉轴（这里是垂直方向）上居中 */
    /* justify-content: center; */
    justify-content: space-between;
    /* 调整登录和注册按钮的位置 */
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


.login-form-button {
    width: 100%;
    display: flex;
    justify-content: center;
}

.remember-me {
    float: left;
}

.login-form-forgot {
    float: center;
}

.register-link {
    float: right;
}
</style>