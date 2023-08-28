<template>
    <div>
        <!-- 面包屑导航区域 -->
        <div>
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>部员管理</el-breadcrumb-item>
                <el-breadcrumb-item>部员信息管理</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <el-card>
            <!-- 表格区域 -->
            <el-table :data="userList" border>
                <el-table-column prop="name" label="姓名"></el-table-column>
                <el-table-column prop="number" label="工号"></el-table-column>
                <el-table-column prop="status" label="权限">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.type === 1">管理员</el-tag>
                        <el-tag type="success" v-else>用户</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="职责">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.status === 0">机构</el-tag>
                        <el-tag type="success" v-else>电控</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <el-button icon="el-icon-edit" type="primary" round size="mini"></el-button>
                    <el-button icon="el-icon-delete" type="danger" round size="mini"></el-button>
                    <el-button icon="el-icon-setting" type="warning" round size="mini"></el-button>
                </el-table-column>
            </el-table>
            <!-- 分页区域 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="queryInfo.page" :page-sizes="[5, 7, 10, 20]" :page-size="queryInfo.pageSize"
                layout="total, sizes, prev, pager, next" :total="total">
            </el-pagination>
        </el-card>
    </div>
</template>

<script>
import { getUserList } from '@/api/user'
export default {
    data() {
        return {
            userList: [],
            total: 0,
            queryInfo: {
                page: 1,
                pageSize: 7,
                query: ''
            }
        }
    },
    created() {
        this.getUserList()
    },
    methods: {
        async getUserList() {
            const res = await getUserList(this.queryInfo)
            this.userList = res.data.records
            this.total = res.data.total
        },
        handleSizeChange(value){
            this.queryInfo.pageSize = value
            this.getUserList()
        },
        handleCurrentChange(value){
            this.queryInfo.page = value
            this.getUserList()
        }
    }
}
</script>

<style></style>