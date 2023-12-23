<template>
    <div>
        <!-- 面包屑导航区域 -->
        <div>
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>审批流程</el-breadcrumb-item>
                <el-breadcrumb-item>异常专案处理</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <el-card>
            <div>
                <el-row>
                    <el-col :span="1" :offset="8">
                        <h1><i class="el-icon-error" style="color:red"></i></h1>
                    </el-col>
                    <el-col :span="4" :offset="0">
                        <h1 style="text-align: center;">异常专案处理</h1>
                    </el-col>
                </el-row>


            </div>
            <el-table :data="subInfo" style="font-size: 15px;" :highlight-current-row="true">
                <el-table-column prop="caseName" label="专案">
                </el-table-column>
                <el-table-column prop="subName" label="子流程">
                </el-table-column>

                <el-table-column prop="level" label="难度">
                </el-table-column>

                <el-table-column prop="planDays" label="计划时间">
                </el-table-column>

                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-tooltip effect="dark" content="开始阶段" placement="top" :enterable="false"
                            v-if="user.type === 1 && scope.row.startTime === null">
                            <el-button type="success" size="mini" icon="el-icon-video-play" round
                                @click="launch(scope.row)"></el-button>
                        </el-tooltip>
                        <el-tooltip class="item" effect="dark" content="专案详情" placement="right-start">
                            <el-button icon="el-icon-s-promotion" type="primary" size="mini" round
                                @click="openCaseDetail(scope.row)">
                            </el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 显示指定负责人窗口 -->
        <el-dialog title="请确认阶段负责人" :visible.sync="setDirectorVisible" width="30%">
            <el-row>
                <el-col :span="12">
                    <el-select v-model="directors" multiple filterable placeholder="请选择负责人">
                        <el-option-group v-for="group in allUser" :key="group.value" :label="group.label">
                            <el-option v-for="item in group.children" :key="item.id" :label="item.name" :value="item.id">
                            </el-option>
                        </el-option-group>
                    </el-select>
                </el-col>
                <el-col :span="12">
                    <el-date-picker v-model="launchTime" type="date" placeholder="选择开始日期"
                        value-format="yyyy-MM-dd HH:mm:ss">
                    </el-date-picker>
                </el-col>
            </el-row>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setDirectorVisible = false">取 消</el-button>
                <!-- <el-button type="danger" @click="launchSub(curCaseSub)">无负责人启动</el-button> -->
                <el-button type="primary" @click="setDirectorFn()">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { exceptionSub } from '@/api/caseSub'
import { getUserListWithAssistants } from '@/api/user'
import { updateCaseSub, startOrFinish } from '@/api/caseSub'
import { formatDate } from '@/utils/common'
import { setDirector, countUser } from '@/api/caseSubUser'
import { mapState } from 'vuex'
export default {
    name: 'checkException',
    data() {
        return {
            subInfo: [],
            setDirectorVisible: false,
            directors: [],
            curCaseSub: null,
            //所有可以指定的负责人
            allUser: [
                {
                    value: 0,
                    label: '机构',
                    children: []
                },
                {
                    value: 1,
                    label: '电控',
                    children: []
                },
                {
                    value: 2,
                    label: 'IE',
                    children: []
                }
            ],
            // 选择的启动时间
            launchTime: '',
        }
    },
    created() {
        this.exceptionSub()
        this.getAllUser()
    },
    computed: {
        ...mapState(['user'])
    },
    methods: {
        async exceptionSub() {
            const res = await exceptionSub()
            this.subInfo = res.data
        },
        //手动点了开始阶段
        async launch(row) {
            this.initSetDirector(row.id)
        },
        //初始化负责人方法
        async initSetDirector(id) {
            // 获取当前阶段有多少个负责人
            const res = await countUser(id)
            //初始化负责人
            this.directors = res.data.map(item => item.userId)
            //指定负责人窗口
            this.setDirectorVisible = true
            //当前选中专案阶段id
            this.curCaseSub = id
        },
        //获取所有负责人
        async getAllUser() {
            const res = await getUserListWithAssistants()
            if (res.code === 200) {
                this.editUser = res.data
                res.data.forEach((item) => {
                    this.allUser[item.status].children.push(item)
                })
            } else
                this.$message.error(res.msg)
        },
        // 启动
        async launchSub(id) {
            this.$confirm('此操作将开启本阶段, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                //直接开始
                var res = await startOrFinish({ id: id, startTime: this.launchTime })
                if (res.code === 200) {
                    this.$message.success(res.data)
                    this.launchTime = ''
                    this.setDirectorVisible = false
                    this.exceptionSub(this.caseId)
                } else {
                    this.$message.error(res.msg)
                }
            }).catch(()=>{
                // 取消启动
                this.launchTime = ''
            })
        },
        //负责人数据库
        async setDirectorFn() {
            if (this.directors.length === 0) {
                this.$message.error('负责人不能为空')
                return
            }
            if (this.launchTime === '') {
                this.$message.error('请指定启动时间')
                return
            }
            const res = await setDirector({ id: this.curCaseSub, chargeId: this.directors })
            if (res.code === 200) {
                this.$message.success(res.data)
                this.setDirectorVisible = false
                //指定成功后要开始阶段
                this.launchSub(this.curCaseSub)
            } else
                this.$message.error(res.msg)
        },
        //打开专案详情
        openCaseDetail(row) {
            this.$router.push({
                name: '子流程详情',
                query: {
                    caseId: row.caseId,
                    caseName: row.caseName
                }
            })
        }
    }
}
</script>

<style scoped></style>