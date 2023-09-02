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
            <div class="btns">
                <el-button type="info" icon="el-icon-s-order"> 历史记录 </el-button>
            </div>
            <el-table :data="subInfo" stripe border>
                <el-table-column prop="caseName" label="专案">
                </el-table-column>
                <el-table-column prop="subName" label="子流程">
                </el-table-column>

                <el-table-column prop="number" label="专案下序号">
                </el-table-column>

                <el-table-column prop="level" label="难度">
                </el-table-column>

                <el-table-column prop="planDays" label="计划时间">
                </el-table-column>

                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-tooltip effect="dark" content="查看备注" placement="top" :enterable="false">
                            <el-button type="info" size="mini" icon="el-icon-info" round
                                @click="openCommitView(scope.row)"></el-button>
                        </el-tooltip>
                        <el-tooltip effect="dark" content="开始阶段" placement="top" :enterable="false"
                            v-if="scope.row.startTime === null">
                            <el-button type="success" size="mini" icon="el-icon-success" round
                                @click="openCommitView(scope.row)"></el-button>
                        </el-tooltip>
                        <el-tooltip effect="dark" content="编辑阶段" placement="top" :enterable="false">
                            <el-button type="primary" size="mini" icon="el-icon-edit" round
                                @click="openCommitView(scope.row)"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
    </div>
</template>

<script>
import {exceptionSub} from '@/api/caseSub'
export default {
    data() {
        return {
            subInfo:[]
        }
    },
    created(){
        this.exceptionSub()
    },
    methods:{
        async exceptionSub(){
            const res = await exceptionSub()
            this.subInfo = res.data
            console.log(this.subInfo)
        }
    }
}
</script>

<style scoped>
.btns {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 15px;
}
</style>