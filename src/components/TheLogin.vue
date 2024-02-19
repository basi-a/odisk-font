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
                        <a class="login-form-forgot" href="/forget">忘记密码</a>
                        <a class="register-link" href="/regeister">现在注册！！</a>
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
import { LOGIN_ENDPOINT } from '../../api.config.js';
import router from '../router'
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

    // 发送 POST 请求到后端 API，并携带 remember 字段  
    const response = await axios.post(LOGIN_ENDPOINT, data, {  
      withCredentials: formState.remember.value, // 允许跨站点访问控制（CORS）携带 cookie  
      headers: {  
        'Content-Type': 'multipart/form-data', // 设置正确的 Content-Type  
      },  
    }); 
  
    if (response.status === 200) {  
      console.log('Login successful:', response.data);  
  
    //   重定向到 /dashboard 页面  
      router.push('/dashboard');  
    } else {  
      // 处理登录失败的情况  
      console.log('Login failed:', response.data);  
    }  
  } catch (error) {  
    // 处理请求错误  
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
    
<style scoped>  .full-screen-background {
    /* 设置背景图像 */
    background-image:linear-gradient(120deg,#a6c0fe 0%, #f68084 100%);
    /* background-image: url(https://cdn.basi-a.top/images/images_tree.webp); */
    background-size: cover;
    /* 背景图像覆盖整个容器 */
    background-position: center;
    background-repeat: no-repeat; /* 图片不重复 */  
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
}</style>