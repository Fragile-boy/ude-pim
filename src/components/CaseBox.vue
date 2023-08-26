<template>
    <div class="singleBox" style="text-align: center;"
        :class="{ 'normal': leftDay >= 0, 'appliedDelay': leftDay < 0 && leftDelay >= 0, 'delay': leftDay < 0 && leftDelay < 0 }">
        <label class="caseName">{{ data.caseName }}</label>
        <div class="caseSubStatus" min-width="500px">
            <div class="subName">{{ data.subName }}</div>
            <el-progress type="circle" text-color="#ffffff" :stroke-width="15" :percentage="leftRate" :color="showColor"
                :format="showText"></el-progress>
        </div>

        <div class="operation">
            <el-button size="medium" type="danger" icon="el-icon-timer" round @click="openDelayApply(data)">申请延期</el-button>
            <el-button size="medium" type="success" icon="el-icon-success" round @click="finishCaseSub(data)">完结</el-button>
        </div>

        <!-- 日期选择组件 -->
        <el-dialog title="请选择完结日期" :visible.sync="isDatePickerVisible">
            <el-date-picker v-model="selectedFinishDate" type="date" placeholder="请选择完结时间" value-format="yyyy-MM-dd HH:mm:ss"
                :picker-options="pickerOptions"></el-date-picker>
            <div slot="footer" class="dialog-footer">
                <el-button @click="isDatePickerVisible = false">取 消</el-button>
                <el-button type="primary" @click="confirmFinishDate">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { checkResult, formatDate, timeSub } from '@/utils/common'
import { countUser } from '@/api/caseSubUser'
import { mapState } from 'vuex'
import { saveFinishApply } from '@/api/caseFinishApply'
export default {
    props: {
        data: Object
    },
    data() {
        return {
            leftDay: 0,
            leftRate: 0,
            leftDelay: 0,
            isDatePickerVisible: false,
            selectedFinishDate: "",
            pickerOptions: {
                disabledDate(time) {
                    return time.getTime() > Date.now();
                }
            }
        }
    },
    computed: {
        ...mapState(['user'])
    },
    created() {
        setTimeout(this.getPercentage(), 2000)
    },
    methods: {
        getPercentage() {
            //分为已延误和未延误
            var today = new Date()
            today.setHours(0, 0, 0, 0)
            //还未截止
            if (today <= new Date(this.data.presetTime)) {
                //还剩多少天
                var costDay = timeSub(today, this.data.presetTime)
                this.leftDay = costDay
                // 总共多少天
                const totolDay = timeSub(this.data.startTime, this.data.presetTime)
                this.leftRate = Math.ceil(this.leftDay / totolDay * 100)
            } else {
                //已经延期了多少天
                var delayDay = timeSub(this.data.presetTime, today)
                this.leftDay = -delayDay
                //计算延误期限
                this.leftDelay = this.data.applyDelay - delayDay
                //判断是否在延期期限内
                if (this.leftDelay >= 0) {
                    this.leftRate = (this.leftDelay / this.data.applyDelay) * 100
                } else
                    this.leftRate = (delayDay / this.data.planDays) * 100
            }
            if (this.leftRate > 100)
                this.leftRate = 100
            return this.leftRate
        },
        showText() {
            if (this.leftDay >= 0)
                return `剩余${this.leftDay}天`
            else {
                if (this.leftDelay < 0)
                    return `已延误${Math.abs(this.leftDay)}天`
                else
                    return `延期剩余${Math.abs(this.leftDelay)}天`
            }
        },
        //进度条颜色显示
        showColor() {
            if (this.leftDay >= 0)
                return "#67c23a"
            else {
                return "#DFF144"
            }
        },
        //跳转阶段延期申请页
        openDelayApply(caseSub) {
            this.$router.push({
                path: '/delayApply',
                query: {
                    caseSubId: caseSub.id,
                    caseSubName: caseSub.subName,
                    caseName: caseSub.caseName,
                    chargeId: [this.user.id]
                }
            })
        },
        finishCaseSub(caseSub) {
            console.log(caseSub)
            this.$confirm('此操作将提交完结申请, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                //查询是否有多个负责人，如果有，则需要二次提醒，否则通过
                var res = await countUser(caseSub.id)
                if (res.data.length > 1) {
                    var htmlStr = "<h5>该阶段有多个负责人, 您确定已经和其他负责人确认完结进度?</h5><br><br>"
                    for (var i = 0; i < res.data.length; i++) {
                        htmlStr += `<h5><input type="checkBox">  ${res.data[i]}</h5><br>`
                    }
                    this.$confirm(htmlStr, '提示', {
                        dangerouslyUseHTMLString: true,
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(async () => {
                        this.applyFinish(caseSub)
                    })
                } else {
                    this.applyFinish(caseSub)
                }
            })
        },
        async applyFinish(caseSub) {
            //给一个时间框，让用户选择多久结束,将id以标志位传入
            this.isDatePickerVisible = caseSub.id
        },
        async confirmFinishDate() {
            if (this.selectedFinishDate) {
                console.log(this.selectedFinishDate)
                // 接着，将 formattedFinishDate 作为参数提交给后端
                var result = await saveFinishApply({
                    caseSubId: this.isDatePickerVisible,
                    applyId: this.user.id,
                    createTime: this.selectedFinishDate // 添加结束时间参数
                });
                checkResult(result)
                // 关闭日期选择器对话框
                this.isDatePickerVisible = false;
            } else {
                // 用户未选择日期时给出提示
                this.$message.error("请选择完结日期");
            }
        },
    }
}
</script>

<style scoped>
.normal {
    background-color: #A4D8DD;
}

.delay {
    background-color: #EE8192;
    ;
}

.appliedDelay {
    background-color: #7F3393;
}

.singleBox {
    border: 1px solid grey;
    padding-left: 20px;
    padding-right: 20px;
    margin-left: 20px;
    border-radius: 30px;
    margin-bottom: 10px;
    padding-bottom: 10px;
}

.singleBox label {
    font-size: 30px;
    padding-left: 50px;
    padding-right: 50px;
}


.singleBox .caseSubStatus {
    display: flex;
    justify-content: space-between;
}

.singleBox .el-progress {
    margin-right: 10px;
    margin-top: 5px;
}

.singleBox .subName {
    background-color: #81EEA4;
    color: white;
    width: 30%;
    height: 60px;
    line-height: 60px;
    font-size: 20px;
    margin-top: 30px;
    border-radius: 30px;
}



.singleBox .operation {
    margin-top: -20px;
    margin-left: -140px;
}
</style>