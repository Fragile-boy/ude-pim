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
                <el-table-column prop="caseName" label="专案"></el-table-column>
                <el-table-column prop="subName" label="阶段"></el-table-column>
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

        <el-dialog title="提示" :visible.sync="applyDelayVisible" width="30%" :before-close="handleClose">
            <span>这是一段信息</span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import { getSubById, timeSub } from '@/utils/common'
export default {
    name: 'case4me',
    data() {
        return {
            userInfo: [],
            applyDelayVisible:false
        }
    },
    created() {
        this.getSubByUserId(this.user)
    },
    computed: {
        ...mapState(['user'])
    },
    methods: {
        async getSubByUserId(user) {
            const res = await getSubById(user.id)
            this.userInfo = res

            for (var i = 0; i < this.userInfo.length; i++) {
                this.userInfo[i].executionDays = timeSub(this.userInfo[i].startTime, new Date())
                //分为已延误和未延误
                var today = new Date()
                today.setHours(0, 0, 0, 0)
                //还未截止
                if (today <= new Date(this.userInfo[i].presetTime)) {
                    //已经执行了多少天
                    var costDay = timeSub(this.userInfo[i].startTime, today)
                    // 已经执行了多少天/总共多少天
                    this.userInfo[i].percentage = Math.ceil(costDay / this.userInfo[i].planDays * 100)
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
                console.log(this.userInfo)
            }
        },

        percentageText(row) {
            if ('leftDelay' in row) {
                if (row.leftDelay >= 0) {
                    return `延期剩余${row.leftDelay}天`
                }
                return `已延误${-row.leftDelay}天`
            }
            return `已执行${row.executionDays}天`
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