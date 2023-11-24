<template>
    <div class="login_container">
        <div class="loginInfo">
            <div class="avatar_box">
                <img src="@/assets/logo.png" alt="" srcset="">
            </div>
            <div class="title" style="text-align: center;">
                <span>新技研进度管理系统</span>
            </div>
            <el-form ref="loginFormRef" label-width="0px" :rules="rules" class="login_form" :model="loginForm">
                <el-form-item prop="number">
                    <el-input v-model="loginForm.number" prefix-icon="el-icon-user-solid" placeholder="请输入工号"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input type="password" v-model="loginForm.password" prefix-icon="el-icon-s-cooperation"
                        placeholder="请输入密码" @keyup.enter.native="handlerLogin"></el-input>
                </el-form-item>
                <el-form-item>
                    <div class="btns">
                        <el-row>
                            <el-col :span="1">
                                <el-checkbox v-model="rememberPsw">记住密码</el-checkbox>
                            </el-col>
                            <el-col :span="6" :offset="14">
                                <el-button type="warning" @click="visitLogin">游客访问</el-button>
                            </el-col>
                            <el-col :span="3">
                                <el-button type="primary" @click="handlerLogin">登录</el-button>
                            </el-col>
                        </el-row>


                    </div>

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
        var checkUserNumber = (rule, value, callback) => {
            if (!/^\d{6}$/.test(value))
                return callback(new Error("工号是6位纯数字"))
            else
                return callback()
        };
        return {
            loginForm: {
                number: '',
                password: ''
            },
            rules: {
                number: [
                    { required: true, message: '工号不能为空', trigger: 'blur' },
                    { validator: checkUserNumber, trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '密码不能为空', trigger: 'blur' }
                ]
            },
            rememberPsw: false
        }
    },
    created() {
        if (localStorage.getItem('userLogin') !== null) {
            this.loginForm = JSON.parse(localStorage.getItem('userLogin'))
            if (this.loginForm.password !== null)
                this.rememberPsw = true
        }
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
                    if (this.rememberPsw)
                        localStorage.setItem("userLogin", JSON.stringify(this.loginForm))
                    else {
                        this.loginForm.password = null
                        localStorage.setItem("userLogin", JSON.stringify(this.loginForm))
                    }
                    this.setUser(res.data)
                    localStorage.setItem("token", res.data.id)
                    this.$message({
                        message: "登录成功",
                        type: 'success',
                        duration: 900
                    })

                    setTimeout(() => this.$router.push('/common/index'), 1000)
                } else {
                    this.$message.error(res.msg)
                }
            })
        },
        async visitLogin() {
            const res = await loginApi({ number: 888888, password: 123456 })
            if (res.code == 200) {
                this.$message({
                    message: "登录成功",
                    type: 'success',
                    duration: 900
                })
                this.setUser(res.data)
                localStorage.setItem("token", res.data.id)
                setTimeout(() => this.$router.push('/common/index'), 1000)
            }
        }
    }
}
</script>

<style lang="less" scoped>
.login_container {
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

// .btns {
//     display: flex;
//     justify-content: space-between;
// }
</style>