<template>
    <div>
        <el-form ref="form" :model="delayApplyObject" :rules="rules" label-width="90px" class="form">
            <el-form-item label="专案名称:">
                <el-form-item>{{ caseName }}</el-form-item>
            </el-form-item>

            <el-form-item label="子流程:">
                <el-form-item>{{ subName }}</el-form-item>
            </el-form-item>

            <el-form-item label="延期类型" prop="type">
                <el-select v-model="delayApplyObject.type" placeholder="请选择延期类型">
                    <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                </el-select>
            </el-form-item>

            <el-form-item label="原因描述:" prop="applyReason">
                <el-input autosize type="textarea" v-model="delayApplyObject.applyReason"
                    placeholder="请输入延期原因描述"></el-input>
            </el-form-item>

            <el-form-item label="申请天数" prop="applyDays">
                <el-input v-model.number="delayApplyObject.applyDays" placeholder="请输入要申请的天数"></el-input>
            </el-form-item>


            <el-form-item>
                <el-button type="primary" @click="submitDelayForm('form')">提交</el-button>
                <el-button @click="$router.back()">返回</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import { checkResult } from '@/utils/common'
import { saveApply } from '@/api/caseDelayApply'

export default {
    data() {
        return {
            delayApplyObject: {
                caseSubId: null,
                applyId: null,
                applyReason: null,
                applyDays: null,
                type: null
            },
            caseName: 'SXX-F類-焊PCB&焊點檢測',
            subName: '上线跟踪',
            options: [
                {
                    label: "外界因素延期",
                    value: "外界因素延期"
                }, {
                    label: "人为因素延期",
                    value: "人为因素延期"
                }
            ],
            rules: {
                applyDays: [
                    { validator: this.validateNumber, trigger: 'blur' },
                    { required: true, message: '请输入数字', trigger: 'blur' }
                ],
                applyReason: [
                    { required: true, message: '请输入原因', trigger: 'change' }
                ],
                type: [
                    { required: true, message: '请选择类型', trigger: 'blur' }
                ]
            }
        }
    },
    created() {
        console.log(this.$route.query.caseSubId)
        if (this.$route.query.caseSubId === undefined) {
            this.$message.warning("请不要搞破坏，按照正确流程操作")
            setTimeout(() => this.$router.back(), 2000)
        }
        this.delayApplyObject.caseSubId = this.$route.query.caseSubId
        this.delayApplyObject.applyId = this.user.id
        this.subName = this.$route.query.caseSubName
        this.caseName = this.$route.query.caseName
    },
    computed: {
        ...mapState(['user'])
    },
    methods: {
        async submitDelayForm(form) {
            var flag = 1
            this.$refs[form].validate((valid) => {
                if (!valid) {
                    flag = 0
                }
            })
            if (flag === 0)
                return
            // console.log(this.delayApplyObject)
            var res = await saveApply(this.delayApplyObject)
            checkResult(res)
            if (res.code === 200)
                setTimeout(() => this.$router.back(), 1000)
        },
        validateNumber(rule, value, callback) {
            if (value < 0) {
                callback(new Error("不能是负数"))
            } else if (value > 150) {
                callback(new Error("申请的次数不能超过15天"))
            }
            callback()
        }
    }
}
</script>

<style scoped>
.form {
    width: 800px;
    height: 400px;
    text-align: center;
    background-color: #eee;
    position: absolute;
    left: 55%;
    top: 50%;
    transform: translate(-50%, -50%);
}
</style>