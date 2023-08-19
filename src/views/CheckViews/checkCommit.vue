<template>
    <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="caseName" label="专案" width="180">
        </el-table-column>
        <el-table-column prop="subName" label="阶段" width="180">
        </el-table-column>
        <el-table-column prop="content" label="备注信息">
        </el-table-column>
        <el-table-column prop="createName" label="申请人">
        </el-table-column>
        <el-table-column prop="createTime" label="申请时间">
        </el-table-column>
        <el-table-column label="操作">
           
            <template slot-scope="scope">
                <el-button type="success" @click="passCheck(scope.row)">通过</el-button>
                <el-button type="primary">拒绝</el-button>
            </template>
        </el-table-column>
    </el-table>
</template>

<script>
import { getPendingReview, passCheck } from '@/api/caseSubCommit'
export default {
    data() {
        return {
            tableData: []
        }
    },
    created() {
        this.getCommits()
    },
    methods: {
        async getCommits() {
            var res = await getPendingReview()
            this.tableData = res.data
        },
        async passCheck(row){
            var res = await passCheck({id:row.id,status:1})
            this.$message.success(res.data)
            setTimeout(()=>this.$router.go(0),1000)
        }
    }
}
</script>

<style></style>