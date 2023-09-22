<template>
    <el-menu background-color="#343743" text-color="#fff" active-text-color="#409eff" :default-active="$route.path"
        :collapse="isCollapse" :collapse-transition="false" router>
        <el-submenu index="1" v-if="user.type===1">
            <template slot="title">
                <i class="el-icon-s-platform"></i>
                <span>专案管理</span>
            </template>
            <el-menu-item index="/index"><i class="el-icon-s-tools"></i>专案详情</el-menu-item>
            <el-menu-item index="/caseList"><i class="el-icon-s-tools"></i>专案管理</el-menu-item>
            <el-menu-item index="/subManage"><i class="el-icon-s-tools"></i>子流程管理</el-menu-item>
            <el-menu-item index="/templeteManage"><i class="el-icon-s-tools"></i>模板管理</el-menu-item>
            <el-menu-item index="/taskManage"><i class="el-icon-s-tools"></i>任务管理</el-menu-item>
        </el-submenu>

        <el-submenu index="2" v-if="user.type===1">
            <template slot="title">
                <i class="el-icon-s-operation"></i>
                <span>审批流程<el-badge :value="subList.length" is-dot
                        v-if="subList.length || delayList.length || finishList.length || taskList.length || caseSubList.length" /></span>
            </template>
            <el-menu-item index="/exception"><i class="el-icon-s-tools"></i>异常专案处理<el-badge :value="subList.length"
                    v-if="subList.length" /></el-menu-item>
            <el-menu-item index="/delay"><i class="el-icon-s-tools"></i>延期申请<el-badge :value="delayList.length"
                    v-if="delayList.length" /></el-menu-item>
            <el-menu-item index="/finish"><i class="el-icon-s-tools"></i>完结申请<el-badge :value="finishList.length"
                    v-if="finishList.length" /></el-menu-item>
            <el-menu-item index="/study"><i class="el-icon-s-tools"></i>任务申请<el-badge :value="taskList.length"
                    v-if="taskList.length" /></el-menu-item>
            <el-menu-item index="/caseApply"><i class="el-icon-s-tools"></i>专案类申请<el-badge :value="caseSubList.length"
                    v-if="caseSubList.length" /></el-menu-item>
        </el-submenu>

        <el-submenu index="3" v-if="user.type===1">
            <template slot="title">
                <i class="el-icon-s-data"></i>
                <span>数据统计</span>
            </template>
            <el-menu-item index="/caseAnalysis"><i class="el-icon-s-tools"></i>月报分析</el-menu-item>
            <!-- <el-menu-item><i class="el-icon-s-tools"></i>部员数据分析</el-menu-item> -->
        </el-submenu>

        <el-submenu index="4" v-if="user.type===1">
            <template slot="title">
                <i class="el-icon-s-custom"></i>
                <span>部员管理</span>
            </template>
            <el-menu-item index="/userList"><i class="el-icon-s-tools"></i>部员信息管理</el-menu-item>
            <el-menu-item index="/userProject"><i class="el-icon-s-tools"></i>部员专案统计</el-menu-item>
            <el-menu-item index="/userProjectTracking"><i class="el-icon-s-tools"></i>部员专案追踪</el-menu-item>
        </el-submenu>

        <el-submenu index="5" v-if="user.type===0">
            <template slot="title">
                <i class="el-icon-user"></i>
                <span>个人中心<el-badge is-dot :value="logList.length" class="item" v-if="logList.length" /></span>
            </template>
            <el-menu-item index="/user/index"><i class="el-icon-s-tools"></i>个人总览</el-menu-item>
            <el-menu-item index="/user/info"><i class="el-icon-s-tools"></i>消息中心<el-badge :value="logList.length"
                    v-if="logList.length" /></el-menu-item>
            <el-menu-item index="/user/progress"><i class="el-icon-s-tools"></i>执行任务</el-menu-item>
            <el-menu-item index="/user/statistics"><i class="el-icon-s-tools"></i>数据统计</el-menu-item>
        </el-submenu>

        <el-menu-item><a target="_blank" href="https://scmail.ude-corp.com/"><i
                    class="el-icon-s-promotion"></i>邮件系统</a></el-menu-item>
    </el-menu>
</template>

<script>
import { mapActions, mapState } from 'vuex'
export default {

    props: {
        isCollapse: Boolean
    },

    data() {
        return {

        }
    },
    computed: {
        ...mapState('log', ['logList']),
        ...mapState('apply', ['delayList', 'subList', 'finishList', 'caseSubList', 'taskList']),
        ...mapState(['user'])
    },
    async created() {
        this.getLogList(),
            this.getDelay(),
            this.exceptionSub(),
            this.getFinish(),
            this.getCaseSubApplyList(),
            this.getTaskList(),
            // 设置定时器，每隔300000毫秒执行一次getLogList，getDelay，exceptionSub，getFinish，getCaseSubApplyList，getTaskList函数
            setInterval(() => {
                this.getLogList(),
                    this.getDelay(),
                    this.exceptionSub(),
                    this.getFinish(),
                    this.getCaseSubApplyList(),
                    this.getTaskList()
            },10000)
    },
    methods: {
        ...mapActions('log', ['getLogList']),
        ...mapActions('apply', ['getDelay', 'exceptionSub', 'getFinish', 'getCaseSubApplyList', 'getTaskList']),
    }
}
</script>

<style scoped>
.el-menu {
    border-right: none;
}

a {
    text-decoration: none;
    color: white;
}

.item {
    margin-left: 5px;
    font-size: 2px;
}
</style>