<template>
    <div class="body">
        <div class="loginInfo">
            <div class="avatar_box">
                <img src="@/assets/logo.png" alt="" srcset="">
            </div>
            <div class="title" style="text-align: center;">
                <span>新技研进度管理系统</span>
            </div>
            <el-form ref="loginFormRef" label-width="0px" :rules="rules" class="login_form" :model="loginForm">
                <el-form-item prop="userName">
                    <el-input v-model.number="loginForm.number" prefix-icon="el-icon-user-solid"
                        placeholder="请输入工号"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input type="password" v-model="loginForm.password" prefix-icon="el-icon-s-cooperation"
                        placeholder="请输入密码"></el-input>
                </el-form-item>
                <el-form-item class="btns">
                    <el-button type="primary" @click="handlerLogin">登录</el-button>
                    <el-button type="info" @click="resetForm">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
import { mapMutations } from 'vuex'
import { loginApi } from '@/api/login'
export default {
    data() {
        var checkUserName = (rule, value, callback) => {
            if (!/^52\d{4}/.test(value))
                return callback(new Error("工号是以52开头的6位数字"))
            else
                return callback()
        }
        return {
            loginForm: {
                number: null,
                password: ''
            },
            remember: false,
            rules: {
                userName: [
                    { validator: checkUserName, trigger: 'blur' },
                ],
                password: [
                    { required: true, message: '密码不能为空', trigger: 'blur' }
                ]
            }
        }
    },
    created() {
        this.loginForm.number = localStorage.getItem("userNumber")
        this.loginForm.password = localStorage.getItem("password")
        if (this.loginForm.password !== null)
            this.remember = true
    },
    methods: {
        ...mapMutations(['setUser']),
        //登录
        async handlerLogin() {
            this.$refs.loginFormRef.validate(async valid => {
                if (!valid) return;
                const res = await loginApi(this.loginForm)
                if (res.code == 200) {
                    //持久化存储上一个登录成功的账号
                    localStorage.setItem("userNumber", this.pimNumber)
                    //如果点击了记住密码
                    if (this.remember)
                        localStorage.setItem("password", this.password)
                    this.setUser(res.data)
                    // localStorage.setItem("user", JSON.stringify(res.data))
                    this.$message({
                        message: "登录成功",
                        type: 'success',
                        duration: 900
                    })
                    setTimeout(() => this.$router.push('/home'), 1000)
                } else {
                    this.$message.error(res.msg)
                }
            })
        },
        fn() {
            if (this.remember) {
                localStorage.setItem("password", this.password)
            } else {
                localStorage.removeItem("password")
            }
        }
    }
}
</script>

<style lang="less" scoped>
.body {
    height: 100%;
    background-color: #2b4b6b;
}

.loginInfo {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 500px;
    height: 330px;
    background-color: rgb(247, 247, 247);
    border-radius: 20px;

    .avatar_box {
        height: 130px;
        width: 130px;
        border: 1px solid #eee;
        border-radius: 50%;
        padding: 10px;
        box-shadow: 0, 0, 10px, #ddd;
        position: absolute;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #fff;

        img {
            background-color: #eee;
            width: 100%;
            height: 100%;
            border-radius: 50%;
        }
    }
}

.title {
    margin-top: 70px;
    font-size: 30px;
}

.login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
}

.btns {
    display: flex;
    justify-content: flex-end;
}
</style>