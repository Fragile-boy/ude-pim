<template>
    <el-card>
        <!-- 返回控件 -->
        <el-page-header @back="$router.go(-1)" content="周会回顾">
        </el-page-header>
        <el-table :data="lastWeekMeeting" style="font-size:20px">
            <el-table-column width="80">
                <template slot-scope="scope">
                    <el-tag effect="dark" type="success" v-if="scope.row.type==='1'">专案</el-tag>
                    <el-tag effect="dark" type="warning" v-else-if="scope.row.type==='0'">任务</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="name" label="名称" width="500"></el-table-column>
            <el-table-column label="内容">
                <template slot-scope="scope">
                    <div style="white-space: pre-wrap;">{{ scope.row.content }}</div>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
                <template slot-scope="scope">
                    <el-button type="primary" effect="dark" size="mini" round
                        @click="removeElement(scope.$index)">已追踪</el-button>
                </template>
            </el-table-column>
        </el-table>
    </el-card>
</template>

<script>
import { getLastWeekComment } from "@/api/caseSubCommit"
export default {
    data() {
        return {
            // 周会信息
            lastWeekMeeting: [],
        }
    },
    created() {
        this.getLastWeekMeeting()
    },
    methods: {
        // 获得上周周会新增的备注
        async getLastWeekMeeting() {
            const res = await getLastWeekComment()
            if (res.code === 200) {
                this.lastWeekMeeting = res.data
                console.log(this.lastWeekMeeting)
            } else
                this.$message.error("获取周会备注数据失败！")
        },
        // 移除某个元素
        removeElement(index) {
            this.lastWeekMeeting.splice(index, 1)
        }
    }
}
</script>

<style></style>