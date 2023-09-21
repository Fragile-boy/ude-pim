<template>
    <div><!-- 面包屑导航区域 -->
        <div>
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>个人中心</el-breadcrumb-item>
                <el-breadcrumb-item>消息中心</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <el-card>
            <!-- 日志任务的详情 -->
            <el-table :data="logList">
                <el-table-column prop="content" label="消息"></el-table-column>
                <el-table-column prop="createName" label="操作人"></el-table-column>
                <el-table-column prop="createTime" label="消息时间"></el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button type="primary" @click="handleCheckMessage(scope.row)" round>已阅</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
    </div>
</template>

<script>
import { checkLog } from '@/api/log'
import { mapActions, mapState } from 'vuex'
export default {
    computed:{
        ...mapState('log',['logList'])
    },
    methods: {
        ...mapActions('log',['getLogList','checkMessage']),
        async handleCheckMessage(row){
            const res = await this.checkMessage(row)
            this.$message.success(res.data)
            this.getLogList()
        }
    }
}
</script>

<style scoped></style>