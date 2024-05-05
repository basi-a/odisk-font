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
                    <template v-if="column.dataIndex === 'status'">
                        <div v-if="record.status === false">
                            <a-progress :stroke-color="{ '0%': '#fbc2eb', '100%': '#a6c1ee', }" :percent="getRecordPercent(record)" />
                            <!-- background-image:linear-gradient(0deg,#fbc2eb 0%, #a6c1ee 100%) -->
                        </div>
                        <div v-if="record.status === true">
                            <a-progress :stroke-color="{ '0%': '#fbc2eb', '100%': '#a6c1ee', }" :percent="100" />
                        </div>
                    </template>
                </template>
            </a-table>
        </div>
        <div v-else>
            <component :is=TheEmpty></component>
        </div>
        <a-float-button shape="circle" @click="handleRefresh" :style="{ right: '80px', bottom: '220px', }">
            <template #icon>
                <ReloadOutlined />
            </template>
        </a-float-button>
    </div>
</template>

<script setup>
import { ref, reactive, onUnmounted } from "vue";
import axios from 'axios';
import { ENDPOINTS } from '@/api.config.js';
import TheEmpty from "../TheEmpty.vue";
import {
    ReloadOutlined,
} from '@ant-design/icons-vue';

const userInfo = ref(JSON.parse(localStorage.getItem('userInfo')));
const tasklist = ref(null);
const columns = [

    // {
    //     title: 'Task ID',
    //     dataIndex: 'ID',
    //     width: 60,

    // },
    {
        title: 'Upload ID',
        dataIndex: 'uploadID',
        width: 150,
    },
    {
        title: 'Object Name',
        dataIndex: 'objectname',
        width: 200,
    },
    {
        title: 'Size',
        dataIndex: 'size',
        width: 80,
    },
    {
        title: 'Status / Progress',
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
        // console.log(response)
        // if (response.status === 200) {
        //     tasklist.value = response.data.data;
        // }
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

// 新增：用于存储每个任务ID对应的进度
const taskProgress = reactive({});
// 新增方法：根据record获取进度百分比
const getRecordPercent = (record) => {
  return taskProgress[record.ID] || 0; // 如果找不到对应ID的进度，则默认返回0
};

// 新增：定期更新进度的定时器标识
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

// 新增：初始化定时器，每秒更新进度
const initProgressUpdate = () => {
    progressUpdateTimer = setInterval(() => {
        tasklist.value.forEach(task => {
            if (!task.status) {
                getPercent(task.ID); // 只更新状态为false的任务
            }
        });
    }, 1000);
};
// 新增：在组件卸载时清理定时器
onUnmounted(() => {
    clearInterval(progressUpdateTimer);
});

// // 修改getTaskList方法，初始化时调用getPercent更新进度
// const getTaskList = async () => {
//     // ...（保留原有的getTaskList逻辑）
//     if (response.status === 200) {
//         tasklist.value = response.data.data;
//         // 初始化所有任务的进度信息
//         response.data.data.forEach(task => {
//             taskProgress[task.ID] = task.status ? 100 : 0; // 根据status初始化进度
//         });
//         initProgressUpdate(); // 初始化定时器
//     }
// };
</script>

<style>
.ant-table-striped .table-striped td {
    background-color: #fafafa;
}
</style>
