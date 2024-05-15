<template>
    <div v-if=usersList>
        <a-table class="ant-table-striped" :columns="columns" :data-source="usersList" :scroll="{ x: 400, y: 900 }"
            :pagination="pagination" :row-class-name="(_record, index) => (index % 2 === 1 ? 'table-striped' : null)"
            bordered>

            <template #bodyCell="{ column, text, record }">
                <template v-if="['username', 'permission'].includes(column.dataIndex)">
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
                            <a-typography-link @click="updateUser(record)">保存</a-typography-link>
                            <a-popconfirm title="确定取消？" @confirm="cancel(record.ID)">
                                <a>取消</a>
                            </a-popconfirm>
                        </span>
                        <span v-else>
                            <a @click="edit(record.ID)">编辑</a>

                            <a-popconfirm title="确定要删除这个用户？" ok-text="Yes" cancel-text="No"
                                v-if="record.permission !== 'userAdmin' && record.permission !== 's3Admin'"
                                @confirm="DeleteTheUser(record.email)" @cancel="cancelDelete">
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
</template>
<script setup>
import TheEmpty from "../TheEmpty.vue";
import { ref, computed, reactive } from "vue";
import { message } from 'ant-design-vue';
import {
    ReloadOutlined,
} from '@ant-design/icons-vue';
import { cloneDeep } from 'lodash';
import Swal from 'sweetalert2';
import axios from 'axios';
import { ENDPOINTS } from '@/api.config.js';

const usersList = ref([]);
const getUserList = async () => {
    try {
        const response = await axios.get(ENDPOINTS.users.list, {
            withCredentials: true,
        });
        usersList.value = response.data.data
    } catch (error) {
        console.log(error)
    }
}
getUserList();
const handleRefresh = async () => {
    const status = await getUserList();
    if (status === 200) {
        message.success("Refresh Success.");
    }
}

const columns = [
    {
        title: '用户ID',
        dataIndex: 'ID',
        width: 30,
    },
    {
        title: '权限',
        dataIndex: 'permission',
        width: 50,
    },
    {
        title: '邮箱地址',
        dataIndex: 'email',
        width: 150,
    },
    {
        title: '用户名',
        dataIndex: 'username',
        width: 150,
    },
    {
        title: '密码',
        dataIndex: 'Password',
        width: 150,
    },
    {
        title: '操作',
        dataIndex: 'operation',
        width: 100,
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

const editableData = reactive({});
const edit = ID => {
    editableData[ID] = cloneDeep(usersList.value.filter(item => ID === item.ID)[0]);
};


const updateUser = async (record) => {
    try {
        if (editableData[record.ID].username === "" || editableData[record.ID].permission === "" ){
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
            "username": editableData[record.ID].username,
            "email": record.email,
            "permission": editableData[record.ID].permission
        });
        const response = await axios.post(ENDPOINTS.users.updete, raw, {
            withCredentials: true
        });
        if (response.status === 200) {
            Object.assign(usersList.value.filter(item => record.ID === item.ID)[0], editableData[record.ID]);
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
const cancel = ID => {
    delete editableData[ID];
};

const DeleteTheUser = async (email) => {
    message.success('Click on Yes');
    try {
        const raw = JSON.stringify({
            "email": email
        });
        const response = await axios.post(ENDPOINTS.users.delete, raw, {
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
const cancelDelete = (e) => {
    console.log(e);
    message.error('Click on No');
}
</script>
<style>
.editable-row-operations a {
    margin-right: 8px;
}
</style>