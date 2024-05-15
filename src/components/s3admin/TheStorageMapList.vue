<template>
    <div v-if=mapList>
        <a-table class="ant-table-striped" :columns="columns" :data-source="mapList" :scroll="{ x: 400, y: 900 }"
            :pagination="pagination" :row-class-name="(_record, index) => (index % 2 === 1 ? 'table-striped' : null)"
            bordered>

            <template #bodyCell="{ column, text, record }">
                <template v-if="['BucketName'].includes(column.dataIndex)">
                    <div>
                        <a-input v-if="editableData[record.ID]"
                            v-model:value="editableData[record.ID][column.dataIndex]" style="margin: -5px 0" />
                        <template v-else>
                            {{ text }}
                        </template>
                    </div>
                </template>
                <template v-else-if="column.dataIndex === 'operation'">
                    <div class="editable-row-operations">
                        <span v-if="editableData[record.ID]">
                            <a-typography-link @click="UpdateTheMap(record)">保存</a-typography-link>
                            <a-popconfirm title="确定取消？" @confirm="cancel(record.ID)">
                                <a>取消</a>
                            </a-popconfirm>
                        </span>
                        <span v-else>
                            <a @click="edit(record.ID)">编辑</a>

                            <a-popconfirm title="确定要删除这个映射？" ok-text="Yes" cancel-text="No"
                                @confirm="DelateTheMap(record)" @cancel="cancelDelete">
                                <a>删除</a>
                            </a-popconfirm>

                        </span>
                    </div>
                </template>

            </template>
        </a-table>
    </div>
    <div v-else>
        <component :is=TheEmpty></component>
    </div>
    <a-float-button shape="circle" @click="handleRefresh" :style="{ right: '80px', bottom: '220px', }" tooltip="刷新">
        <template #icon>
            <ReloadOutlined />
        </template>
    </a-float-button>
    <a-float-button shape="circle" @click="JumpTO" :style="{ right: '80px', bottom: '150px', }" tooltip="新标签页打开 MinIO console">
        <template #icon>
            <LinkOutlined />
        </template>
    </a-float-button>
</template>
<script setup>
const MINIO_BROWSER = import.meta.env.VITE_MINIO_BROWSER
import TheEmpty from "../TheEmpty.vue";
import {
    ReloadOutlined,
    LinkOutlined,
} from '@ant-design/icons-vue';
import axios from 'axios';
import { cloneDeep } from 'lodash';
import { ref, computed, reactive } from "vue";
import { ENDPOINTS } from '@/api.config.js';
import Swal from 'sweetalert2';
const mapList = ref([]);
const getMapList = async () => {
    try {
        const response = await axios.get(ENDPOINTS.s3.bucketmap.list, {
            withCredentials: true,
        });

        mapList.value = response.data.data
        // console.log(mapList.value)
    } catch (error) {
        console.log(error)
    }
}
const handleRefresh = async () => {
    const status = await getMapList();
    if (status === 200) {
        message.success("Refresh Success.");
    }
}
getMapList();
const JumpTO = () => {
    window.open(MINIO_BROWSER, '_blank');
}

const columns = [
    {
        title: '映射关系ID',
        dataIndex: 'ID',
        width: 80,
    },
    {
        title: '用户ID',
        dataIndex: 'UserID',
        width: 80,
    },
    {
        title: '存储桶名',
        dataIndex: 'BucketName',
        width: 150,
    },
    {
        title: '创建时间',
        dataIndex: 'CreatedAt',
        width: 100,
    },
    {
        title: '操作',
        dataIndex: 'operation',
        width: 80,
    }
]

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

const editableData = reactive({});
const edit = ID => {
    editableData[ID] = cloneDeep(mapList.value.filter(item => ID === item.ID)[0]);
};
const cancel = ID => {
    delete editableData[ID];
};
const cancelDelete = (e) => {
    console.log(e);
    message.error('Click on No');
}
const UpdateTheMap = async (record) => {
    try {
        if (editableData[record.ID].BucketName === "" ){
            delete editableData[record.ID];
            Swal.fire({
                icon: 'error',
                title: '更新失败',
                text: '不能输入空值',
                showConfirmButton: false,
                timer: 1500,
            });
            return
        }
        const raw = JSON.stringify({
            "userID": record.UserID,
            "bucketname": record.BucketName,
            "newBucketname": editableData[record.ID].BucketName,
        });
        const response = await axios.post(ENDPOINTS.s3.bucketmap.update, raw, {
            withCredentials: true
        });
        if (response.status === 200) {
            Object.assign(mapList.value.filter(item => record.ID === item.ID)[0], editableData[record.ID]);
            delete editableData[record.ID];
            Swal.fire({
                icon: 'success',
                title: '更新成功',
                showConfirmButton: false,
                timer: 1500,
            });

        } else {
            Swal.fire({
                icon: 'error',
                title: '更新失败',
                showConfirmButton: false,
                timer: 1500,
            });
        }
    } catch (error) {
        console.log(error)
        Swal.fire({
            icon: 'error',
            title: '更新失败',
            showConfirmButton: false,
            timer: 1500,
        });
    }
}

const DelateTheMap = async (record) => {
    try {
        const raw = JSON.stringify({
            "userID": record.UserID,
            "bucketname": record.BucketName,
        });
        const response = await axios.post(ENDPOINTS.s3.bucketmap.delate, raw, {
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
        console.log(error)
        Swal.fire({
            icon: 'error',
            title: '删除失败',
            showConfirmButton: false,
            timer: 1500,
        });
    }finally{
        handleRefresh();
    }
}
</script>
<style></style>