<template>
    <div class="app">
        <a-layout style="min-height: 100vh">
            <a-layout-sider v-model:collapsed="collapsed" collapsible>
                <div class="logo"></div>
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
            <a-layout>
                <a-layout-header style="background: #fff;">
                    <a-avatar src="	https://q2.qlogo.cn/headimg_dl?dst_uin=3188765573&spec=100" />
                </a-layout-header>
                <a-layout-content style="margin: 0 16px">
                    <!-- <component :is="currentComponent"></component> -->
                    <component :is=currentComponent></component>
                </a-layout-content>
                <a-layout-footer style="text-align: center; height: 10px;">asgfasg</a-layout-footer>
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
import TheFileManager from "./dashboard/TheFileManager.vue";
import TheTaskManager from "./dashboard/TheTaskManager.vue";
import TheDashboarUserProfile from '../components/dashboard/TheDashboarUserProfile.vue';
const collapsed = ref(true);
const selectedKeys = ref(['2']);
const components = {
    '1': TheFileManager,
    '2': TheTaskManager, // Add components for tasks
    '3': TheTaskManager, // Add components for tasks
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

</script>


<style scoped>
.logo {
    height: 32px;
    margin: 16px;
    background-image: linear-gradient(0deg, #fbc2eb 0%, #a6c1ee 100%);
}

/* .site-layout .site-layout-background {
    background: #fff;
}

[data-theme='dark'] .site-layout .site-layout-background {
    background: #141414;
} */
</style>