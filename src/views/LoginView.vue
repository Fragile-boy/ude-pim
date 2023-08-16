<template>
    <div class="body">
        <!-- <div class="logo"></div> -->
        <div class="loginInfo">
            <div class="title" style="text-align: center;">
                <span>新技研进度管理系统</span>
            </div>
            <div class="inputArea">
                <el-input v-model="pimNumber" clearable placeholder="请输入你的工号" prefix-icon="el-icon-user-solid"></el-input>
                <el-input v-model="password" clearable placeholder="请输入密码" prefix-icon="el-icon-s-cooperation" show-password
                    @keyup.native.enter="login"></el-input>
                <div class="loginArea" style="text-align: center;">
                    <el-checkbox v-model="remember" @change="fn">记住密码</el-checkbox>
                    <el-button type="primary" @click="login">登录</el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapMutations } from 'vuex'
export default {
    data() {
        return {
            pimNumber: '',
            password: '',
            remember: false
        }
    },
    created(){
        this.pimNumber = localStorage.getItem("userNumber")
        this.password = localStorage.getItem("password")
        if(this.password!==null)
            this.remember = true
    },
    methods: {
        ...mapMutations(['setUser']),
        //登录
        login() {
            console.log(this.pimNumber)
            console.log(this.password)
            this.$axios.post('/user/login', {
                number: this.pimNumber,
                password: this.password
            }).then(res => {
                if (res.data.code == 200) {
                    
                    //持久化存储上一个登录成功的账号
                    localStorage.setItem("userNumber", this.pimNumber)
                    //如果点击了记住密码
                    if(this.remember)
                        localStorage.setItem("password", this.password)
                    this.setUser(res.data.data)
                    localStorage.setItem("user", JSON.stringify(res.data.data))
                    this.$message({
                        message:"登录成功",
                        type:'success',
                        duration:900
                    })
                    setTimeout(()=>this.$router.push('/home'),1000)
                } else {
                    this.$message.error(res.data.msg)
                }
            }).catch(err => {
                console.log(err)
            })
        },
        fn() {
            if (this.remember) {
                localStorage.setItem("password", this.password)
            }else{
                localStorage.removeItem("password")
            }
        }
    }
}
</script>

<style scoped>
.body {
    width: 1920px;
    height: 1080px;
    background-color: rgb(13, 110, 253);
}

/* 
.body>>>.logo {
    width: 100px;
    height: 100px;
    background-color: #fff;
    background-image: url("../assets/logo.png");
    background-size: cover;
    margin-left: 20px;
} */

.body>>>.loginInfo {
    width: 500px;
    height: 300px;
    background-color: rgb(247, 247, 247);
    border: 1px solid grey;
    margin: auto;
    border-radius: 20px;
    margin-top: 300px;
}

.body>>>.title {
    height: 80px;
    line-height: 100px;
    font-size: 30px;
    align-content: center;
}

.body>>>.inputArea {
    margin-left: 40px;
    margin-right: 40px;
    margin-top: 30px;
}


.body>>>.el-checkbox {
    display: block;
    margin-left: -350px;
}

.body>>>.el-input {
    margin-bottom: 20px;
}
</style>