<template>
    <div><!-- 面包屑导航区域 -->
        <div>
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>个人中心</el-breadcrumb-item>
                <el-breadcrumb-item>消息中心</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <el-card v-if="!showApply">
            <el-row>
                <el-col :span="2" :offset="22">
                    <el-button icon="el-icon-s-claim" type="warning" @click="showApply = true">我的申请</el-button>
                </el-col>
            </el-row>
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

        <el-card v-if="showApply">
            <el-row>
                <el-col :span="2" :offset="22">
                    <el-button icon="el-icon-chat-dot-round" type="warning" @click="showApply = false">我的消息</el-button>
                </el-col>
            </el-row>
            <h3>专案类申请</h3>
            <el-table :data="applyCaseSubList">
                <el-table-column prop="caseName" label="专案"></el-table-column>
                <el-table-column prop="subName" label="阶段"></el-table-column>
                <el-table-column prop="description" label="描述"></el-table-column>
                <el-table-column prop="createTime" label="创建时间"></el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button type="danger" size="medium" round @click="removeCaseSubApply(scope.row.id)">撤 回</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <hr>
            <h3>任务类申请</h3>
            <el-table :data="applyTaskList">
                <el-table-column label="类型">
                    <template slot-scope="scope">
                        <el-tag type="warning" effect="dark" v-if="scope.row.type === 1">临时任务</el-tag>
                        <el-tag type="primary" effect="dark" v-else>技术研究</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="description" label="描述"></el-table-column>
                <el-table-column prop="planDays" label="计划时间"></el-table-column>
                <el-table-column prop="createTime" label="创建时间"></el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button type="danger" size="medium" round @click="removeTaskApply(scope.row.id)">撤 回</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <hr>
            <h3>延期申请</h3>
            <el-table :data="delayList">
                <el-table-column label="类型">
                    <template slot-scope="scope">
                        <el-tag type="success" effect="dark" v-if="scope.row.caseSubId">专案类</el-tag>
                        <el-tag type="warning" effect="dark" v-if="scope.row.type === 1">临时任务</el-tag>
                        <el-tag type="primary" effect="dark" v-if="scope.row.type === 2">技术研究</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="description" label="描述"></el-table-column>
                <el-table-column prop="applyDays" label="申请时间"></el-table-column>
                <el-table-column prop="predictTime" label="预计完成时间"></el-table-column>
                <el-table-column prop="applyReason" label="申请原因"></el-table-column>
                <el-table-column prop="delayType" label="延期类型"></el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button type="danger" size="medium" round @click="removeDelayApply(scope.row.id)">撤 回</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <hr>
            <h3>完结申请</h3>
            <el-table :data="finishList">
                <el-table-column label="类型">
                    <template slot-scope="scope">
                        <el-tag type="success" effect="dark" v-if="scope.row.caseSubId">专案类</el-tag>
                        <el-tag type="warning" effect="dark" v-if="scope.row.type === 1">临时任务</el-tag>
                        <el-tag type="primary" effect="dark" v-if="scope.row.type === 2">技术研究</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="description" label="描述"></el-table-column>
                <el-table-column prop="applyTime" label="申请完结时间"></el-table-column>
                <el-table-column prop="createTime" label="创建时间"></el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button type="danger" size="medium" round @click="removeFinishApply(scope.row.id)">撤
                            回</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <hr>
        </el-card>
    </div>
</template>

<script>
import { checkLog } from '@/api/log'
import { mapActions, mapState } from 'vuex'
import { checkingApplyCaseSub,removeCaseSubApply} from '@/api/applyCaseSub'
import { checkingApplyTask,removeTaskApply} from '@/api/applyTask'
import { getDelayListByUserId,removeDelayApply} from '@/api/caseDelayApply'
import { getFinishListByUserId, removeFinishApply } from '@/api/caseFinishApply'
export default {
    data() {
        return {
            showApply: false,
            applyCaseSubList: [],
            applyTaskList: [],
            delayList: [],
            finishList: [],
        }
    },
    created() {
        this.getAllList()
    },
    computed: {
        ...mapState('log', ['logList']),
        ...mapState(['user'])
    },
    methods: {
        ...mapActions('log', ['getLogList', 'checkMessage']),
        async handleCheckMessage(row) {
            const res = await this.checkMessage(row)
            this.$message.success(res.data)
            this.getLogList()
        },
        async getAllList() {
            var res = await checkingApplyCaseSub(this.user.id)
            if (res.code === 200) {
                this.applyCaseSubList = res.data
            } else {
                this.$message.error(res.msg)
                return
            }

            // 获取任务申请列表
            res = await checkingApplyTask(this.user.id)
            if (res.code === 200) {
                this.applyTaskList = res.data
            } else {
                this.$message.error(res.msg)
                return
            }

            // 获取延期申请列表
            res = await getDelayListByUserId(this.user.id)
            if (res.code === 200) {
                this.delayList = res.data
            } else {
                this.$message.error(res.msg)
                return
            }

            //获取完结申请列表
            res = await getFinishListByUserId(this.user.id)
            if (res.code === 200) {
                this.finishList = res.data
            } else {
                this.$message.error(res.msg)
                return
            }

            console.log(this.applyCaseSubList)
            console.log(this.applyTaskList)
            console.log(this.delayList)
            console.log(this.finishList)
        },
        //撤回完结申请
        removeFinishApply(id) {
            this.$confirm('确定要删除该申请吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                var res = await removeFinishApply(id)
                if (res.code === 200) {
                    this.$message.success(res.data)
                    this.getAllList()
                }else{
                    this.$message.error(res.msg)
                }
            })
        },
        // 撤回延期申请
        removeDelayApply(id) {
            this.$confirm('确定要删除该申请吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                var res = await removeDelayApply(id)
                if (res.code === 200) {
                    this.$message.success(res.data)
                    this.getAllList()
                }else{
                    this.$message.error(res.msg)
                }
            })
        },
        // 撤回任务类申请
        removeTaskApply(id) {
            this.$confirm('确定要删除该申请吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                var res = await removeTaskApply(id)
                if (res.code === 200) {
                    this.$message.success(res.data)
                    this.getAllList()
                }else{
                    this.$message.error(res.msg)
                }
            })
        },
        // 撤回专案类申请
        removeCaseSubApply(id) {
            this.$confirm('确定要删除该申请吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                var res = await removeCaseSubApply(id)
                if (res.code === 200) {
                    this.$message.success(res.data)
                    this.getAllList()
                }else{
                    this.$message.error(res.msg)
                }
            })
        }
    }
}
</script>

<style scoped></style>