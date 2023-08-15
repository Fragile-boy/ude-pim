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
            <router-link to="/user">个人管理</router-link>
        </div>

    </div>
</template>

<script>
export default {
    data() {
        return {
            user:{}
        }
    },
    mounted(){
        this.user = JSON.parse(localStorage.getItem("user"))
        console.log(this.user)
    },
    methods: {
        logout() {
            this.userName = ''
            if(localStorage.getItem("user")===null)
                return
            this.$axios.post('/user/logout')
                .then(res => {
                    console.log(res.data.data)
                })
            localStorage.removeItem('user')
            this.$router.push('/login')
            
        }
    }
}
</script>

<style scoped>
.nav {
    height: 1080px;
    background-color: rgb(33, 37, 41);
    display: flex;
    flex-direction: column;
}

.nav .logo {
    width: 150px;
    height: 150px;
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
    width: 50px;
    height: 100px;
    color: white;
    margin-bottom: 30px;
    margin-top: 30px;
    margin-left: 18px;
}
</style>