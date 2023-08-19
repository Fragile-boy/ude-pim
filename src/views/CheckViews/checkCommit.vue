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
                <el-button type="success" @click="handleCheck(scope.row, 1)">通过</el-button>
                <el-button type="primary" @click="handleCheck(scope.row, 2)">拒绝</el-button>
            </template>
        </el-table-column>
    </el-table>
</template>

<script>
import { getPendingReview, handleCheck } from '@/api/caseSubCommit'
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
        async handleCheck(row, status) {
            //这里catch的return不能结束方法的执行，他表示该promise对象的返回值，所以用外部标志位来决定是否执行后面的逻辑
            var flag = 1
            if (status === 2) {
                flag = await this.$prompt('请输入原因', '您正在拒绝申请', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                }).then(({value})=>{
                    if(value===''||value===null){
                        this.$message.error("请输入拒绝原因")
                        return 0
                    }
                    row.reason = value
                    return 1
                }).catch(()=>{
                    //如果点击取消，则什么也不做
                    return 0
                })
            }
            if(flag!==0){
                row.status = status
                await handleCheck(row)
                this.$message.success("审核已完成")
                setTimeout(() => this.$router.go(0), 1000)
            }
        }
    }
}
</script>

<style></style>