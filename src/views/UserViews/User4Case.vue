<template>
    <div><!-- 面包屑导航区域 -->
        <div>
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>个人中心</el-breadcrumb-item>
                <el-breadcrumb-item>执行任务</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <el-card>
            <el-table :data="userInfo">
                <el-table-column label="进度">
                    <template slot-scope="scope">
                        <el-progress :stroke-width="24" :percentage="scope.row.percentage"
                            :status="'leftDelay' in scope.row ? scope.row.leftDelay >= 0 ? 'warning' : 'exception' : 'success'"></el-progress>
                    </template>
                </el-table-column>
                <el-table-column prop="comment" label="备注"></el-table-column>
                <el-table-column prop="description" label="描述"></el-table-column>
                <el-table-column prop="startTime" label="开始时间"></el-table-column>
                <el-table-column prop="presetTime" label="预计时间"></el-table-column>
                <el-table-column prop="planDays" label="计划时间"></el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-tooltip class="item" effect="dark" content="申请延期" placement="left">
                            <el-button size="mini" type="warning" icon="el-icon-timer" round
                                @click="openDelayApply(scope.row)"></el-button>
                        </el-tooltip>
                        <el-tooltip class="item" effect="dark" content="完结" placement="right">
                            <el-button size="mini" type="success" icon="el-icon-success" round
                                @click="finishCaseSub(scope.row)"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <el-dialog title="申请延期" :visible.sync="applyDelayVisible" width="30%">
            <el-form ref="form"  :model="delayApplyObject" label-width="90px" class="form">
                <el-form-item label="专案名称">
                    <el-input v-model="delayApplyObject.caseName" disabled></el-input>
                </el-form-item>

                <el-form-item label="阶段">
                    <el-input v-model="delayApplyObject.subName" disabled></el-input>
                </el-form-item>

                <el-form-item label="延期类型" prop="type">
                    <el-select v-model="delayApplyObject.type" placeholder="请选择延期类型">
                        <el-option v-for="item in ['外界因素延期','人为因素延期']" :key="item" :label="item" :value="item">
                        </el-option>
                    </el-select>
                </el-form-item>

                <el-form-item label="原因描述:" prop="applyReason">
                    <el-input autosize type="textarea" v-model="delayApplyObject.applyReason"
                        placeholder="请输入延期原因描述"></el-input>
                </el-form-item>

                <el-form-item label="申请天数" prop="applyDays">
                    <el-input v-model.number="delayApplyObject.applyDays" placeholder="请输入要申请的天数"></el-input>
                </el-form-item>


                <el-form-item>
                    <el-button type="primary" @click="submitDelayForm('form')">提交</el-button>
                    <el-button @click="$router.back()">返回</el-button>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="applyDelayVisible = false">取 消</el-button>
                <el-button type="primary" @click="applyDelayVisible = false">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import { timeSub } from '@/utils/common'
import { taskList } from '@/api/task'
export default {
    name: 'case4me',
    data() {
        return {
            userInfo: [],
            applyDelayVisible: false,
            delayApplyObject:{}
        }
    },
    created() {
        this.getTaskByUserId(this.user)
    },
    computed: {
        ...mapState(['user'])
    },
    methods: {
        async getTaskByUserId(user) {
            const res = await taskList(user.id)
            this.userInfo = res.data

            for (var i = 0; i < this.userInfo.length; i++) {
                this.userInfo[i].executionDays = timeSub(this.userInfo[i].startTime, new Date())
                //分为已延误和未延误
                var today = new Date()
                //还未截止
                if (today <= new Date(this.userInfo[i].presetTime)) {
                    //已经执行了多少天
                    var costDay = timeSub(this.userInfo[i].startTime, today)
                    // 已经执行了多少天/总共多少天
                    this.userInfo[i].percentage = costDay*1.0 / this.userInfo[i].planDays * 100
                } else {
                    //已经延期了多少天
                    var delayDay = timeSub(this.userInfo[i].presetTime, today)
                    //计算延误期限
                    this.userInfo[i].leftDelay = this.userInfo[i].applyDelay - delayDay
                    //判断是否在延期期限内
                    if (this.userInfo[i].leftDelay >= 0) {
                        this.userInfo[i].percentage = (delayDay / this.userInfo[i].applyDelay) * 100
                    } else
                        this.userInfo[i].percentage = (timeSub(this.userInfo[i].startTime, today) / this.userInfo[i].planDays) * 100
                }
                this.userInfo[i].comment = this.percentageText(this.userInfo[i])
                if (this.userInfo[i].percentage > 100)
                    this.userInfo[i].percentage = 100
            }
        },

        percentageText(row) {
            console.log(row)
            if ('leftDelay' in row) {
                if (row.leftDelay >= 0) {
                    return `延期剩余${row.leftDelay}天`
                }
                return `已延误${row.applyDelay-row.leftDelay}天`
            }
            return `已执行${row.executionDays}天`
        },
        openDelayApply(row) {
            this.applyDelayVisible = true
            this.delayApplyObject = {...row}
        }
    }
    // computed:{
    //     ...mapState('user','userInfo')
    // }
}
</script>

<style scoped>
li {
    list-style: none;
    display: inline;
}

ul {
    display: flex;
}

</style>