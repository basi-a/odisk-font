<template>
    <div :style="{ padding: '2px' }">
        <a-breadcrumb>
            <a-breadcrumb-item><a href="/dashboard">首页</a></a-breadcrumb-item>
            <a-breadcrumb-item>任务管理</a-breadcrumb-item>
        </a-breadcrumb>
    </div>


    <div :style="{ padding: '24px', background: '#fff', minHeight: '93vh' }">
        <div v-if=tasklist>
            <a-table class="ant-table-striped" :columns="columns" :data-source="tasklist" :scroll="{ x: 400, y: 900 }"
                :pagination="pagination"
                :row-class-name="(_record, index) => (index % 2 === 1 ? 'table-striped' : null)" bordered>
                <template #bodyCell="{ column, record }">
                    <template v-if="column.dataIndex === 'objectname'">

                        <span><a @click="showDrawer(record)">{{ record[column.dataIndex] }}</a></span>
                    </template>
                    <template v-if="column.dataIndex === 'status'">
                        <div v-if="record.status === 'removed'">
                            <a-progress :stroke-color="{ '0%': '#fbc2eb', '100%': '#a6c1ee', }" :percent="0"
                                status="exception" />
                        </div>
                        <div v-if="record.status === 'uploading'">
                            <a-progress :stroke-color="{ '0%': '#fbc2eb', '100%': '#a6c1ee', }"
                                :percent="getRecordPercent(record)" />
                        </div>
                        <div v-if="record.status === 'done'">

                            <a-progress :stroke-color="{ '0%': '#fbc2eb', '100%': '#a6c1ee', }" :percent="100" />
                        </div>
                    </template>
                </template>
            </a-table>
        </div>
        <div v-else>
            <component :is=TheEmpty></component>
        </div>
        <a-drawer v-model:open="drawerOpen" class="custom-class" root-class-name="root-class-name" :width="'30%'"
            placement="right">
            <div v-if=selectedRecord>
                <a-descriptions title="任务详情" layout="vertical" bordered>
                    <a-descriptions-item label="Object Name">{{ selectedRecord.objectname }}</a-descriptions-item>
                    <a-descriptions-item label="uploadID">{{ selectedRecord.uploadID }}</a-descriptions-item>
                    <a-descriptions-item label="Task ID">{{ selectedRecord.ID }}</a-descriptions-item>
                    <a-descriptions-item label="Size">{{ selectedRecord.size }}</a-descriptions-item>
                    <a-descriptions-item label="Status">{{ selectedRecord.status }}</a-descriptions-item>
                </a-descriptions>
                <br />

                <a-descriptions title="任务操作" layout="vertical"></a-descriptions>

                <div style="display: flex; align-items: center;">
                    <a-popconfirm title="你确定要删除这个任务记录？" ok-text="Yes" cancel-text="No" @confirm="taskdel"
                        @cancel="cancel">
                        <a-button class="file-operation-buttons">删除</a-button>
                    </a-popconfirm>

                    <a-popconfirm title="你确定要取消？" ok-text="Yes" cancel-text="No" @confirm="taskAbort"
                        v-if="selectedRecord.status === 'uploading'" @cancel="cancel">
                        <a-button class="file-operation-buttons">取消上传</a-button>
                    </a-popconfirm>

                </div>
            </div>
        </a-drawer>

        <a-float-button shape="circle" @click="handleRefresh" :style="{ right: '80px', bottom: '220px', }" tooltip="刷新">
            <template #icon>
                <ReloadOutlined />
            </template>
        </a-float-button>
    </div>
</template>

<script setup>
import { ref, reactive, onUnmounted } from "vue";
import Swal from 'sweetalert2';
import axios from 'axios';
import { ENDPOINTS } from '@/api.config.js';
import TheEmpty from "../TheEmpty.vue";
import {
    ReloadOutlined,
} from '@ant-design/icons-vue';

const userInfo = ref(JSON.parse(localStorage.getItem('userInfo')));
const tasklist = ref(null);
const drawerOpen = ref(false);
const selectedRecord = ref(null);
const showDrawer = (record) => {
    selectedRecord.value = record;
    drawerOpen.value = true;
};
const columns = [
    {
        title: '对象名称',
        dataIndex: 'objectname',
        width: 100,
    },
    {
        title: 'UploadID (分片上传专用)',
        dataIndex: 'uploadID',
        width: 150,
    },
    {
        title: '文件大小',
        dataIndex: 'size',
        width: 50,
    },
    {
        title: '上传进度',
        dataIndex: 'status',
        width: 200,
    }
];
const pagination = reactive({
    // 表格分页的配置
    current: 1,
    pageSize: 10,
    showSizeChanger: true, // 用于控制展示每页多少条的下拉
    // showQuickJumper: true,
    total: 0,
    pageSizeOptions: ['10', '20', '50'],
    showTotal: (total) => `共 ${total} 条`,
    onShowSizeChange: pageSizeChange,
    onChange: pageChange
})
// 页数改变的方法
function pageSizeChange(val, pageNum) {
    pagination.pageSize = pageNum // 修改每页显示的条数
    pagination.current = 1
}
// 点击上一页下一页的方法
function pageChange(page, val) {
    console.log(page, val)
    pagination.current = page
}
const getTaskList = async () => {
    try {
        const raw = JSON.stringify({
            "bucketname": userInfo.value.bucketname,
        });
        const response = await axios.post(ENDPOINTS.s3.upload.task.getlist, raw, {
            withCredentials: true,
        });

        if (response.status === 200) {
            tasklist.value = response.data.data.sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));
            // 初始化所有任务的进度信息
            response.data.data.forEach(task => {
                taskProgress[task.ID] = task.status ? 100 : 0; // 根据status初始化进度
            });
            initProgressUpdate(); // 初始化定时器
        }
    } catch (error) {
        console.log(error);
    }
};

getTaskList();
const handleRefresh = async () => {
    const status = await getTaskList();
    if (status === 200) {
        message.success("Refresh Success.");
    }
}


import { message } from 'ant-design-vue';
const taskdel = async () => {
    message.success('Click on Yes');
    const raw = JSON.stringify({ "taskID": selectedRecord.value.ID });
    try {
        const response = await axios.post(ENDPOINTS.s3.upload.task.delete, raw, {
            withCredentials: true,
        });
        if (response.status === 200) {
            Swal.fire({
                icon: 'success',
                title: '删除成功',
                showConfirmButton: false,
                timer: 1500,
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: '删除失败',
                showConfirmButton: false,
                timer: 1500,
            });
        }
    } catch (error) {
        console.log(error);
        Swal.fire({
            icon: 'error',
            title: '删除失败',
            showConfirmButton: false,
            timer: 1500,
        });
    }
    handleRefresh();
}

const taskAbort = async () => {
    message.success('Click on Yes');
    try {
        const raw = JSON.stringify({
            "bucketname": userInfo.value.bucketname,
            "objectname": selectedRecord.value.objectname,
            "uploadID": selectedRecord.value.uploadID,
            "taskID": selectedRecord.value.ID,
        });
        const response = await axios.delete(ENDPOINTS.s3.upload.task.abort, {
            withCredentials: true,
            data: raw,
        });
        if (response.status === 200) {
            Swal.fire({
                icon: 'success',
                title: '删除成功',
                showConfirmButton: false,
                timer: 1500,
            });
        }
    } catch (error) {

    }
    handleRefresh();
}

const cancel = e => {
    console.log(e);
    message.error('Click on No');
};
// 用于存储每个任务ID对应的进度
const taskProgress = reactive({});
// 根据record获取进度百分比
const getRecordPercent = (record) => {
    return taskProgress[record.ID] || 0; // 如果找不到对应ID的进度，则默认返回0
};

// 定期更新进度的定时器标识
let progressUpdateTimer;

const getPercent = async (taskID) => {

    const url = `${ENDPOINTS.s3.upload.task.getPercent}/${taskID}`;
    try {
        const response = await axios.get(url, {
            withCredentials: true,
        });
        const percent = response.data.data.percent;
        taskProgress[taskID] = percent; // 更新进度映射

        // 检查进度是否达到100%，如果是则更新状态
        if (percent === 100) {
            const taskToUpdate = tasklist.value.find(task => task.ID === taskID);
            if (taskToUpdate) {
                taskToUpdate.status = true; // 更新任务状态为true
            }
        }
    } catch (error) {
        console.log(error);
    }
};

//初始化定时器，每秒更新进度
const initProgressUpdate = () => {
    progressUpdateTimer = setInterval(() => {
        tasklist.value.forEach(task => {
            if (task.status === "uploading") {
                getPercent(task.ID);
            }
        });
    }, 1500);
};
// 在组件卸载时清理定时器
onUnmounted(() => {
    clearInterval(progressUpdateTimer);
});


</script>

<style>
.ant-table-striped .table-striped td {
    background-color: #fafafa;
}

.file-operation-buttons {
    width: 46%;
    margin-right: 2%;
    margin-left: 2%;
    margin-top: 2%;
}

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
