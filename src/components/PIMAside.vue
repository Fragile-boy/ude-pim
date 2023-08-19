<template>
    <div class="nav" style="text-align: center;">
        <div class="logo">
            <router-link to="/">
                <img src="../assets/logo.png" title="返回主页">
            </router-link>
        </div>

        <div class="logout">
            <el-button @click="logout">{{ user.name }}<i class="el-icon-switch-button"></i></el-button>
        </div>

        <div class="menuList">
            <router-link to="/home">主页</router-link>
            <router-link to="/manageCase">专案管理</router-link>
            <router-link to="/manageCaseSub">子流程管理</router-link>
            <router-link to="/check" v-if="user.type===1">审批管理</router-link>
            <router-link to="/user" v-if="user.type===1">部员管理</router-link>
            <router-link to="/user" v-else>个人管理</router-link>
            
        </div>

    </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex'
import { logout } from '@/api/login'
export default {
    data() {
        return {
            
        }
    },
    computed:{
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
                message:"登出成功",
                duration:1000
            })
            localStorage.removeItem('user')
            this.$router.push('/login')
            
        }
    }
}
</script>

<style scoped>
.nav {
    width: 200px;
    height: 130vh;
    background-color: rgb(33, 37, 41);
    display: flex;
    flex-direction: column;
}

.nav .logo {
    width: 150px;
    height: 150px;
    margin-left: 23px;
}

.menuList {
    /* display: flex;
    flex-direction: column; */
    font-size: 25px;
}


.menuList a {
    display: block;
    width: 100%;
    height: 30px;
    color: skyblue;
    text-decoration: none;
    margin-top: 60px;
    border-bottom: 1px solid grey;
}

a:hover {
    color: orange;
}

a.router-link-active{
    color: orange;
}

.logout {
    color: white;
    margin-bottom: 30px;
    margin-top: 30px;
}
</style>