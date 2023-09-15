<template>
    <div>
        <!-- 面包屑导航区域 -->
        <div>
            <el-breadcrumb separator="/">
                <el-breadcrumb-item to="/index">主页</el-breadcrumb-item>
                <el-breadcrumb-item>审批流程</el-breadcrumb-item>
                <el-breadcrumb-item>异常专案处理</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <el-card>
            <div>
                <h1 style="text-align: center;">异常专案处理</h1>
            </div>
            <el-table :data="subInfo" stripe border>
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
                            v-if="scope.row.startTime === null">
                            <el-button type="success" size="mini" icon="el-icon-video-play" round
                                @click="launch(scope.row)"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 显示指定负责人窗口 -->
        <el-dialog title="阶段暂无负责人" :visible.sync="setDirectorVisible" width="30%">
            <el-select v-model="directors" multiple filterable placeholder="请选择负责人">
                <el-option-group v-for="group in allUser" :key="group.value" :label="group.label">
                    <el-option v-for="item in group.children" :key="item.id" :label="item.name" :value="item.id">
                    </el-option>
                </el-option-group>
            </el-select>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setDirectorVisible = false">取 消</el-button>
                <el-button type="danger" @click="launchSub(curCaseSub)">无负责人启动</el-button>
                <el-button type="primary" @click="setDirectorFn()">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { exceptionSub } from '@/api/caseSub'
import { getUserList } from '@/api/user'
import { updateCaseSub, startOrFinish } from '@/api/caseSub'
import { formatDate } from '@/utils/common'
import { setDirector } from '@/api/caseSubUser'
export default {
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
                }
            ],
        }
    },
    created() {
        this.exceptionSub()
        this.getAllUser()
    },
    methods: {
        async exceptionSub() {
            const res = await exceptionSub()
            this.subInfo = res.data
            console.log(this.subInfo)
        },
        //手动点了开始阶段
        async launch(row) {
            this.initSetDirector(row.id)
        },
        //初始化负责人方法
        initSetDirector(id) {
            //指定负责人窗口
            this.setDirectorVisible = true
            //初始化负责人
            this.directors = null
            //当前选中专案阶段id
            this.curCaseSub = id
        },
        //获取所有负责人
        async getAllUser() {
            const res = await getUserList()
            if (res.code === 200) {
                this.editUser = res.data
                res.data.forEach((item) => {
                    this.allUser[item.status].children.push(item)
                })
            } else
                this.$message.error(res.msg)
        },
        // 无负责人启动
        async launchSub(id) {
            //直接开始
            var res = await startOrFinish({ id: id, startTime: formatDate(new Date()) + " 00:00:00" })
            if (res.code === 200) {
                this.$message.success(res.data)
                this.setDirectorVisible = false
                this.exceptionSub(this.caseId)
            } else {
                this.$message.error(res.msg)
            }
        },
        //负责人数据库
        async setDirectorFn() {
            const res = await setDirector({ id: this.curCaseSub, chargeId: this.directors })
            if (res.code === 200) {
                this.$message.success(res.data)
                //指定成功后要开始阶段
                this.launchSub(this.curCaseSub)
            } else
                this.$message.error(res.msg)
        },
    }
}
</script>

<style scoped></style>