<template>
    <div class="app">
        <a-layout style="min-height: 100vh">
            <a-layout-sider v-model:collapsed="collapsed" collapsible>
                <div class="logo">
                    <img src="/favicon.svg">
                    <span v-if="!collapsed">网盘系统</span>
                </div>

                <a-menu v-model:selectedKeys="selectedKeys" @select="onSelect" theme="dark" mode="inline">
                    <a-menu-item key="1">
                        <FileOutlined />
                        <span>文件管理</span>
                    </a-menu-item>

                    <a-sub-menu key="sub1">
                        <template #title>
                            <span>
                                <CarryOutOutlined />
                                <span>任务管理</span>
                            </span>
                        </template>
                        <a-menu-item key="2">
                            <span>进行中</span>
                        </a-menu-item>
                        <a-menu-item key="3">
                            <span>已完成</span>
                        </a-menu-item>
                    </a-sub-menu>
                    <a-menu-item key="4">
                        <UserOutlined />
                        <span>个人中心</span>
                    </a-menu-item>
                </a-menu>
            </a-layout-sider>
            <a-layout style="display: flex; flex-direction: column; min-height: 100vh; ">
                <a-layout-header
                    style="height: 45px; background: #fff; display: flex; justify-content: flex-end; align-items: center;">

                    <a-dropdown v-if=userInfo>

                        <a class="ant-dropdown-link" @click.prevent>

                            <span>你好，{{ userInfo.username }}</span>
                            <a-avatar style="margin-left:10px; "
                                src=" https://q2.qlogo.cn/headimg_dl?dst_uin=3188765573&spec=100"
                                size="medium"></a-avatar>
                        </a>

                        <template #overlay>
                            <a-menu @click="onClick">
                                <a-menu-item key="profile">个人中心</a-menu-item>
                                <a-menu-item key="logout">注销</a-menu-item>
                            </a-menu>
                        </template>
                    </a-dropdown>
                </a-layout-header>
                <a-layout-content style="margin: 0 14px">

                    <component :is=currentComponent></component>
                </a-layout-content>
                <!-- <a-layout-footer style="text-align: center; height: 10px;">asgfasg</a-layout-footer> -->
            </a-layout>
        </a-layout>
    </div>
</template>

<script setup>
import { ref, shallowRef } from 'vue';
import {
    CarryOutOutlined,
    UserOutlined,
    FileOutlined,
} from '@ant-design/icons-vue';
import axios from 'axios';
import { ENDPOINTS } from '@/api.config.js';
import router from '@/router'
import Swal from 'sweetalert2';
import TheFileManager from "./dashboard/TheFileManager.vue";
import TheTaskDone from "./dashboard/TheTaskDone.vue";
import TheTaskDoing from "./dashboard/TheTaskDoing.vue";
import TheDashboarUserProfile from './dashboard/TheUserProfile.vue';
const collapsed = ref(false);
const selectedKeys = ref(['1']);
const components = {
    '1': TheFileManager,
    '2': TheTaskDoing, // Add components for tasks
    '3': TheTaskDone, // Add components for tasks
    '4': TheDashboarUserProfile,
};

const currentComponent = shallowRef(components[selectedKeys.value[0]]);
// console.log(selectedKeys.value)
// console.log(selectedKeys.value[0])
const onSelect = (item) => {
    const { key } = item;
    selectedKeys.value[0] = key;
    // console.log(selectedKeys.value[0])
    currentComponent.value = components[selectedKeys.value[0]];
};
const userInfo = ref(null);
async function checkPermission() {
    userInfo.value = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo.permission === 'userAdmin' || userInfo.permission === 's3Admin') {
        Swal.fire({
            icon: 'error',
            title: '访问失败',
            text: '用户权限不正确',
            showConfirmButton: false,
            timer: 1500
        });
    }
}
checkPermission();
const onClick = (item) => {
    const { key } = item;
    if (key === 'profile') {
        goToProfile();
    } else if (key === 'logout') {
        logout();
    }
};

const goToProfile = () => {
    selectedKeys.value = ['4'];
    currentComponent.value = components[selectedKeys.value[0]];
};

const logout = async () => {
    try {
        await axios.get(ENDPOINTS.logout, {
            withCredentials: true,
        });
        // Clear user info and redirect to login page
        userInfo.value = null;

        document.cookie = `session_id=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
        localStorage.removeItem('userInfo')
        sessionStorage.removeItem("currentPrefix");
        router.push('/login');
    } catch (error) {
        console.error('Error logging out:', error);
    }
};

</script>


<style scoped>
.logo {
    height: 32px;
    /* Adjust height as needed */
    margin: 16px;
    max-width: 150px;
    /* Replace with desired maximum width */
    display: flex;
    /* Enable flexbox layout */
    align-items: center;
    /* Align items vertically in the center */
    /* background-image: linear-gradient(0deg, #fbc2eb 0%, #a6c1ee 100%); */
    overflow: hidden;
    /* Hide any content exceeding the max-width */
}

.logo img {
    height: 90%;
    /* Ensure the image fills the container's height */
    vertical-align: middle;
    margin-left: 10px;
    /* Center the image vertically */
}

.logo span {
    color: #fff;
    font-size: 22px;
    margin-left: 10px;
}

.ant-dropdown-link {
    display: flex;
    align-items: center;
    /* Aligns avatar and username vertically */
    color: #565a5a;
}

/* .header-left {}

.header-right {} */
</style>