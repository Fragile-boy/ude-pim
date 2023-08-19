<template>
    <div class="userBox">
        <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" background-color="#545c64"
            text-color="#fff" active-text-color="#ffd04b" :router=true>
            <el-menu-item index="/user/1">
                消息中心
            </el-menu-item>
            <el-menu-item index="/user/2">我的工作台</el-menu-item>
            <el-menu-item index="/user/3">工作总览</el-menu-item>
        </el-menu>
        <div class="userSubView">
            <keep-alive :include="['case4me']">
                <router-view></router-view>
            </keep-alive>
        </div>
    </div>
</template>

<script>
// import { formatDate, getStatus } from '@/utils/common'
export default {
    data() {
        return {
            userInfo: [],
            activeIndex: '1',
        }
    },
    methods: {

    }
}
</script>

<style scoped>
.userBox {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    height: 100vh;
}

.userBox .el-menu-demo{
    height: 8vh;
    width: 186vh;
}

.userBox .userSubView{
    height: 85vh;
    display: flex;
}
</style>