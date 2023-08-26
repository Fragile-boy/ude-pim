<template>
    <el-table :data="tableData" style="width: 100%" border>
        <el-table-column prop="caseName" label="专案" width="300">
        </el-table-column>
        <el-table-column prop="subName" label="阶段" width="100">
        </el-table-column>
        <el-table-column prop="applyName" label="申请人" width="80">
        </el-table-column>
        <el-table-column prop="applyTime" label="申请完结时间" width="120">
        </el-table-column>
        <el-table-column label="操作" width="300">
            <template slot-scope="scope">
                <el-button type="success" @click="handleCheck(scope.row, 1)">通过</el-button>
                <el-button type="primary" @click="handleCheck(scope.row, 2)">拒绝</el-button>
            </template>
        </el-table-column>
    </el-table>
</template>

<script>
import { getFinishApplyList, judgeFinishApply} from '@/api/caseFinishApply'
import { mapState } from 'vuex'
import { formatDate } from '@/utils/common'
export default {
    data() {
        return {
            tableData: []
        }
    },
    computed: {
        ...mapState(['user'])
    },
    created() {
        this.getFinish()
    },
    methods: {
        async getFinish() {
            var res = await getFinishApplyList()
            this.tableData = res.data
            this.tableData.map(item => {
                item.applyTime = formatDate(item.createTime)
            })
        },
        async handleCheck(row, status) {
            //这里catch的return不能结束方法的执行，他表示该promise对象的返回值，所以用外部标志位来决定是否执行后面的逻辑
            var flag = 1
            if (status === 2) {
                flag = await this.$prompt('请输入原因', '您正在拒绝申请', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                }).then(({ value }) => {
                    if (value === '' || value === null) {
                        this.$message.error("请输入拒绝原因")
                        return 0
                    }
                    row.rejectReason = value
                    return 1
                }).catch(() => {
                    //如果点击取消，则什么也不做
                    return 0
                })
            }
            if (flag !== 0) {
                row.status = status
                row.checkUser = this.user.id
                console.log(row)
                await judgeFinishApply(row)
                this.$message.success("审核已完成")
                setTimeout(() => this.$router.go(0), 1000)
            }
        }
    }
}
</script>

<style></style>