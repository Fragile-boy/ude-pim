<template>
    <div class="singleBox" style="text-align: center;"
        :class="{ 'normal': leftDay >= 0, 'appliedDelay': leftDay < 0 && leftDelay>=0, 'delay': leftDay < 0 && leftDelay<0 }">
        <label class="caseName">{{ data.caseName }}</label>
        <div class="caseSubStatus" min-width="500px">
            <div class="subName">{{ data.subName }}</div>
            <el-progress type="circle" text-color="#ffffff" :stroke-width="15" :percentage="leftRate" :color="showColor"
                :format="showText"></el-progress>
        </div>

        <div class="operation">
            <el-button size="medium" type="danger" icon="el-icon-timer" round @click="openDelayApply(data)">申请延期</el-button>
            <el-button size="medium" type="success" icon="el-icon-success" round>完结</el-button>
        </div>
    </div>
</template>

<script>
import { formatDate, timeSub } from '@/utils/common'
import { mapState } from 'vuex'
export default {
    props: {
        data: Object
    },
    data() {
        return {
            leftDay: 0,
            leftRate: 0,
            leftDelay: 0,
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
                this.leftDelay = this.data.applyDelay-delayDay
                //判断是否在延期期限内
                if( this.leftDelay>=0){
                    this.leftRate = (this.leftDelay/this.data.applyDelay)*100
                }else
                    this.leftRate = (delayDay/this.data.planDays)*100
            }
            if (this.leftRate > 100)
                this.leftRate = 100
            return this.leftRate
        },
        showText() {
            if (this.leftDay >= 0)
                return `剩余${this.leftDay}天`
            else{
                if(this.leftDelay<0)
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
        }
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