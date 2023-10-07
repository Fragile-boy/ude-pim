<template>
    <div>
        <!-- 面包屑导航区域 -->
        <div>
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>专案管理</el-breadcrumb-item>
                <el-breadcrumb-item :to="{ path: '/index' }">主页</el-breadcrumb-item>
                <el-breadcrumb-item>{{ caseName }}</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <el-card>
            <el-page-header @back="$router.back()" :content="caseName"></el-page-header>
            <el-table :cell-style="setCellColor" :data="case2person" :span-method="objectSpanMethod" border>
                <el-table-column prop="userName" label="姓名"></el-table-column>
                <el-table-column prop="subName" label="子流程"></el-table-column>
                <el-table-column prop="level" label="难度"></el-table-column>
                <el-table-column prop="value" label="积分"></el-table-column>
                <el-table-column prop="startTime" label="开始时间"></el-table-column>
                <el-table-column prop="finishTime" label="结束时间"></el-table-column>
                <el-table-column prop="planDays" label="计划时间"></el-table-column>
                <el-table-column prop="executionDays" label="执行天数"></el-table-column>
                <el-table-column label="执行状态">
                    <template slot-scope="scope">
                        <el-tag effect="dark" v-if="scope.row.status === 0">正在执行</el-tag>
                        <el-tag effect="dark" v-else-if="scope.row.status === 1" type="success">正常完成</el-tag>
                        <el-tag effect="dark" v-else-if="scope.row.status === 2" type="danger">已延误</el-tag>
                        <el-tag effect="dark" v-else-if="scope.row.status === 3" type="warning">延误完成</el-tag>
                        <el-tag effect="dark" v-else-if="scope.row.status === 4">未开始</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-tooltip class="item" effect="dark" content="计算并复制个人总积分" placement="top">
                            <el-button class="copy-button" type="primary" icon="el-icon-copy-document"
                                @click="computeSumValue(scope.$index)" round></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
    </div>
</template>

<script>

import { listFocusPerson } from '@/api/caseSub'
import { timeSub } from '@/utils/common'
import Clipboard from 'clipboard';

export default {
    data() {
        return {
            case2person: []
        }
    },
    created() {
        this.caseId = this.$route.query.caseId
        this.caseName = this.$route.query.caseName
        this.listFocusPerson(this.caseId)
    },
    methods: {
        async listFocusPerson(id) {
            const res = await listFocusPerson(id);
            if (res.code === 200) {
                this.case2person = res.data
                for (var i = 0; i < this.case2person.length; i++) {
                    //执行状态
                    //未开始
                    if (this.case2person[i].startTime === null)
                        this.case2person[i].status = 4
                    else if (this.case2person[i].finishTime === null) {
                        // 已延误
                        if (timeSub(this.case2person[i].startTime, new Date()) > this.case2person[i].planDays)
                            this.case2person[i].status = 2
                        else {
                            //正在执行
                            this.case2person[i].status = 0
                        }

                    } else {
                        //正常完成
                        if (timeSub(this.case2person[i].startTime, this.case2person[i].finishTime) <= this.case2person[i].planDays)
                            this.case2person[i].status = 1
                        else
                            this.case2person[i].status = 3
                    }
                    //如果结束时间不为空
                    if (this.case2person[i].finishTime !== null) {
                        this.case2person[i].executionDays = timeSub(this.case2person[i].startTime, this.case2person[i].finishTime)
                        this.case2person[i].executionDays -= this.case2person[i].unforcedDays===null?0:+this.case2person[i].unforcedDays
                        if (this.case2person[i].subId !== 7) {
                            //配电要乘以2
                            this.case2person[i].sumValue = (this.case2person[i].planDays * (this.case2person[i].planDays / this.case2person[i].executionDays) ** (2 / 3)).toFixed(2)
                            if (this.case2person[i].subId === 9)
                                this.case2person[i].sumValue *= 2
                            this.case2person[i].value = (this.case2person[i].sumValue * this.case2person[i].directorRate / 100).toFixed(2)
                        }
                    }
                }
                console.log(this.case2person)
            } else {
                this.$message.error(res.msg)
            }
        },
        objectSpanMethod({ row, column, rowIndex, columnIndex }) {
            if (columnIndex === 0 || columnIndex === 9) {
                if (rowIndex != 0 && this.case2person[rowIndex - 1].userId === this.case2person[rowIndex].userId)
                    return [0, 0]
                var curIndex = rowIndex
                while (curIndex < this.case2person.length && this.case2person[rowIndex].userId === this.case2person[curIndex].userId)
                    curIndex++
                return [curIndex - rowIndex, 1]
            }
        },
        async computeSumValue(index) {
            var userId = this.case2person[index].userId
            var res = 0
            while (this.case2person[index] != null && 'value' in this.case2person[index] && this.case2person[index].userId === userId) {
                res += +this.case2person[index].value
                index++
            }
            res = res.toFixed(2)

            const clipboard = new Clipboard('.copy-button', {
                text: () => res + '',
            });

            clipboard.on('success', () => {
                // 这里可以添加复制成功后的提示信息
                this.$message.success(`计算结果：${res}，值已复制到粘贴板中`);
                clipboard.destroy();
            });

            clipboard.on('error', () => {
                // 这里可以添加复制失败后的提示信息
                this.$message.success(`复制失败`);
                clipboard.destroy();
            });
        },
        //设定单元格颜色
        setCellColor({ row, column, rowIndex, columnIndex }) {
            if (columnIndex === 3)
                return 'background-color:#fceadb'
            else if (columnIndex === 4)
                return 'background-color:#e1bbb8'
            else if (columnIndex === 5)
                return 'background-color:#C6DEF8'
        }
    }
}
</script>

<style lang="less" scoped>
.el-page-header {
    margin-bottom: 10px;
}
</style>