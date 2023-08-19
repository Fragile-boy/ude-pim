<template>
    <el-form ref="form" label-width="80px">
        <el-form-item label="专案名称:">
            <el-form-item>{{ caseName }}</el-form-item>
        </el-form-item>

        <el-form-item label="子流程:">
            <el-form-item>{{ subName }}</el-form-item>
        </el-form-item>

        <el-form-item label="备注信息:">
            <el-card class="box-card">
                <div v-for="o in content" :key="o" class="text item">
                    {{ o }}
                </div>
                <label v-if="content.length===0">暂无备注</label>
            </el-card>
        </el-form-item>

        <el-form-item label="增加备注:" v-if="user.type===1||chargeId.indexOf(user.id)!==-1">
            <el-input type="textarea" v-model="newContent"></el-input>
        </el-form-item>

        <el-form-item>
            <el-button type="primary" @click="submitCommitForm" v-if="user.type===1||chargeId.indexOf(user.id)!==-1">提交</el-button>
            <el-button @click="$router.back()">返回</el-button>
        </el-form-item>
    </el-form>
</template>

<script>
import { getById, saveCommit } from '@/api/caseSubCommit';
import { mapState } from 'vuex';

export default {
    data() {
        return {
            caseName: 'SXX-F類-焊PCB&焊點檢測',
            subName: '上线跟踪',
            content: [],
            newContent: '',
            caseSubId:0,
            chargeId:[]
        }
    },
    created() {
        //一个子流程可能有多个负责人，所以这里是个数组！！！这里是个数组！！！这里是个数组！！！
        this.chargeId = this.$route.query.chargeId
        this.caseSubId = this.$route.query.caseSubId
        this.subName = this.$route.query.caseSubName
        this.caseName = this.$route.query.caseName
        this.getCommitById(this.caseSubId)
    },
    computed: {
        ...mapState(['user'])
    },
    methods: {
        async getCommitById(id) {
            // 获取专案子流程对应的所有备注
            var res = await getById(id)
            res = res.data
            for (var i = 0; i < res.length; i++) {
                this.content.push(res[i].content)
            }
        },
        async submitCommitForm(){
            //判断备注信息是否为空或者内容太少
            if(this.newContent.length<8){
                this.$message.warning("您输入的内容太少，请尽可能详细描述进度信息")
                return
            }
            const commmitObj = {}
            commmitObj.caseSubId = this.caseSubId
            commmitObj.content = this.newContent
            commmitObj.createUser = this.user.id
            var res = await saveCommit(commmitObj)
            this.$message(res.data)
            // 刷新页面
            setTimeout(()=>this.$router.go(0),1000)
            
        }
    }
}
</script>

<style></style>