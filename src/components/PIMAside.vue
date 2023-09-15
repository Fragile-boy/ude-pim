<template>
    <el-menu background-color="#343743" 
    text-color="#fff" 
    active-text-color="#409eff" 
    :default-active="$route.path"
    :collapse="isCollapse"
    :collapse-transition="false"
    router>
        <el-submenu index="1">
            <template slot="title">
                <i class="el-icon-s-platform"></i>
                <span>专案管理</span>
            </template>
            <el-menu-item index="/index"><i class="el-icon-s-tools"></i>主页</el-menu-item>
            <el-menu-item index="/caseList"><i class="el-icon-s-tools"></i>专案列表</el-menu-item>
            <el-menu-item index="/subManage"><i class="el-icon-s-tools"></i>子流程管理</el-menu-item>
            <el-menu-item index="/templeteManage"><i class="el-icon-s-tools"></i>模板管理</el-menu-item>
        </el-submenu>

        <el-submenu index="2">
            <template slot="title">
                <i class="el-icon-s-operation"></i>
                <span>审批流程</span>
            </template>
            <el-menu-item index="/exception"><i class="el-icon-s-tools"></i>异常专案处理</el-menu-item>
            <el-menu-item index="/delay"><i class="el-icon-s-tools"></i>延期申请</el-menu-item>
            <el-menu-item index="/finish"><i class="el-icon-s-tools"></i>完结申请</el-menu-item>
            <el-menu-item index="/study"><i class="el-icon-s-tools"></i>任务申请</el-menu-item>
            <el-menu-item index="/caseApply"><i class="el-icon-s-tools"></i>专案类申请</el-menu-item>
        </el-submenu>

        <el-submenu index="3">
            <template slot="title">
                <i class="el-icon-s-data"></i>
                <span>数据统计</span>
            </template>
            <el-menu-item index="/caseAnalysis"><i class="el-icon-s-tools"></i>专案数据分析</el-menu-item>
            <el-menu-item><i class="el-icon-s-tools"></i>部员数据分析</el-menu-item>
        </el-submenu>

        <el-submenu index="4">
            <template slot="title">
                <i class="el-icon-s-custom"></i>
                <span>部员管理</span>
            </template>
            <el-menu-item index="/userList"><i class="el-icon-s-tools"></i>部员信息管理</el-menu-item>
            <el-menu-item><i class="el-icon-s-tools"></i>部员专案管理</el-menu-item>
        </el-submenu>

        <el-submenu index="5">
            <template slot="title">
                <i class="el-icon-user"></i>
                <span>个人中心</span>
            </template>
            <el-menu-item index="/user/index"><i class="el-icon-s-tools"></i>个人总览</el-menu-item>
            <el-menu-item><i class="el-icon-s-tools"></i>消息中心</el-menu-item>
            <el-menu-item index="/user/progress"><i class="el-icon-s-tools"></i>执行任务</el-menu-item>
            <el-menu-item><i class="el-icon-s-tools"></i>数据统计</el-menu-item>
        </el-submenu>

        <el-menu-item><a target="_blank" href="https://scmail.ude-corp.com/"><i class="el-icon-s-promotion"></i>邮件系统</a></el-menu-item>
    </el-menu>
</template>

<script>
import { mapMutations, mapState } from 'vuex'
import { logout } from '@/api/login'
export default {

    props:{
        isCollapse:Boolean
    },

    data() {
        return {

        }
    },
    computed: {
        ...mapState(['user'])
    },
    methods: {
        ...mapMutations(['setUser']),
        async logout() {
            this.setUser({})
            // if(localStorage.getItem("user")===null)
            //     return
            await logout()
            this.$message.success({
                message: "登出成功",
                duration: 1000
            })
            localStorage.removeItem('user')
            this.$router.push('/login')

        }
    }
}
</script>

<style scoped>
.el-menu {
    border-right: none;
}

a{
    text-decoration: none;
    color:white;
}
</style>