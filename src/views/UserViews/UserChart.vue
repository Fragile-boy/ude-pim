<template>
    <div>
        <div>
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>个人中心</el-breadcrumb-item>
                <el-breadcrumb-item>数据统计</el-breadcrumb-item>
                <el-breadcrumb-item>图表统计</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <el-card>
            <el-row style="margin-bottom: 10px;">
                <el-col :span="2">
                    <el-button type="primary" icon="el-icon-back" @click="$router.back()">表格视图</el-button>
                </el-col>
                <el-col :span="8" :offset="7" v-if="start_stop_time">
                    <h2>{{ start_stop_time[0] }}——{{ start_stop_time[1] }}</h2>
                </el-col>
                
            </el-row>
            <div class="charts-area">
                <el-card class="pie-chart">
                    <h2>任务类别</h2>
                    <div id="taskType" style="width: 100%; height: 400px;"></div>
                </el-card>
                <el-card class="bar-chart">
                    <h2>任务达成</h2>
                    <div id="taskAchieve" style="width: 100%; height: 400px"></div>
                </el-card>
            </div>
        </el-card>
    </div>
</template>

<script>
export default {
    data() {
        return {
            allTaskList: [],
            barInfo:{
                'months':[],
                'finishCount':[],
                'finishDaysCount':[],
                'taskAchieveRate':[],
                'timeAchieveRate':[]
            },
            start_stop_time:null
        }
    },
    created() {
        this.allTaskList = this.$route.query.allTaskList
        this.start_stop_time = this.$route.query.start_stop_time
    },
    mounted() {
        this.initPie(),
        this.initBar()
    },
    methods: {
        // 初始化饼状图
        initPie() {
            var typePie = this.$echarts.init(document.getElementById('taskType'))
            var res = [{ name: '专案类', value: 0 }, { name: '临时事务', value: 0 }, { name: '技术研究', value: 0 }]
            this.allTaskList.forEach(s => {
                if (s.caseSubId) {
                    res[0].value++
                } else if (s.type === 1)
                    res[1].value++
                else if (s.type === 2)
                    res[2].value++
            })
            typePie.setOption({
                legend: {
                    orient: 'vertical',
                    left: 0,
                    top: 'bottom'
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '<h4>{b}:{c}</h4><br><h4>比例:{d}%<h4>'
                },
                series: [
                    {
                        type: 'pie',
                        stillShowZeroSum: false,
                        data: res,
                        radius: '90%',
                        itemStyle: {
                            color: function (params) {
                                if (params.data.name === "专案类")
                                    return '#67c23a'
                                else if (params.data.name === "临时事务")
                                    return '#e6a23c'
                                else if (params.data.name === "技术研究")
                                    return '#409eff'
                            }
                        },
                    },

                ]
            })
        },
        //初始化柱状图
        initBar() {
            this.handleBarInfo()
            var burInfo = this.$echarts.init(document.getElementById('taskAchieve'))
            var names = Object.keys(this.barInfo)
            names = names.filter(item => item !== 'months').map((item) => {
                if (item === 'finishCount')
                    item = '完成任务（件）'
                else if (item === 'finishDaysCount')
                    item = '完成任务时长（天）'
                else if (item === 'taskAchieveRate')
                    item = '任务达成率'
                else if (item === 'timeAchieveRate')
                    item = '时长达成率'
                return item
            })
            burInfo.setOption({
                legend: {
                    orient: 'vertical',
                    data: names,
                    top: 'top',
                    right: 0
                },
                grid: {
                    top: '6%',       //柱状图距离父容器div顶端的距离
                    left: '2%',      //柱状图距离父容器div左端的距离
                    right: '15%',    //柱状图距离父容器div右端的距离
                    bottom: '0%',    //柱状图距离父容器div底端的距离
                    containLabel: true  //grid 区域是否包含坐标轴的刻度标签
                },
                xAxis: {
                    data: this.barInfo.months
                },
                yAxis: [
                    {
                        type: "value",
                        nameTextStyle: {
                            padding: [0, 50, -50, 200]
                        },
                        min: 0,
                        max: this.calMax(this.barInfo.finishDaysCount),
                        splitNumber: 6,
                        interval: ((this.calMax(this.barInfo.finishDaysCount) - 0) / 6).toFixed(),
                    },
                    {
                        type: "value",
                        nameTextStyle: {
                            padding: [0, 50, -50, 200]
                        },
                        min: 0,
                        max: this.calMax(this.barInfo.timeAchieveRate),
                        splitNumber: 6,
                        interval: ((this.calMax(this.barInfo.timeAchieveRate) - 0) / 6).toFixed(),
                        axisLabel: {
                            formatter: function (v) {
                                return v.toFixed(2) + '%'; //0表示小数为0位，1表示1位小数，2表示2位小数
                            }
                        }
                    }],
                tooltip: {
                    trigger: 'axis',
                    formatter: function (params) {
                        var result = params[0].axisValue + '<br/>';
                        params.forEach(function (item) {
                            if (item.seriesName.includes('率'))
                                result += item.marker + item.seriesName + ': ' + item.value + '%<br/>';
                            else
                                result += item.marker + item.seriesName + ': ' + item.value + '<br/>';
                        });
                        return result;
                    }
                },
                series: [
                    {
                        name: names[0],
                        type: 'bar',
                        data: this.barInfo.finishCount,
                        label: {
                            show: true, //开启显示
                            position: 'top', //在上方显示
                        },
                    },
                    {
                        name: names[1],
                        type: 'bar',
                        data: this.barInfo.finishDaysCount,
                        label: {
                            show: true, //开启显示
                            position: 'top', //在上方显示
                        },
                    },
                    {
                        name: names[2],
                        type: 'line',
                        data: this.barInfo.taskAchieveRate,
                        yAxisIndex: 1,
                        label: {
                            show: true, //开启显示
                            position: 'top', //在上方显示
                            formatter:'{c}%'
                        },
                    },
                    {
                        name: names[3],
                        type: 'line',
                        data: this.barInfo.timeAchieveRate,
                        yAxisIndex: 1,
                        label: {
                            show: true, //开启显示
                            position: 'top', //在上方显示
                            formatter:'{c}%'
                        },
                    },
                ]
            })

        },
        //加工信息，获取柱状图所需的数据
        handleBarInfo(){
            var minStartTime = this.allTaskList.reduce((x,y)=>x.finishTime<y.finishTime?x:y)
            var maxStartTime = this.allTaskList.reduce((x,y)=>x.finishTime>y.finishTime?x:y)
            minStartTime = minStartTime.finishTime
            minStartTime = minStartTime.split("-").slice(0,2)

            maxStartTime = maxStartTime.finishTime
            maxStartTime = maxStartTime.split("-").slice(0,2)

            var startYear = +minStartTime[0]
            var startMonth = +minStartTime[1]

            var endYear = +maxStartTime[0]
            var endMonth = +maxStartTime[1]

            console.log(startYear,startMonth,endYear,endMonth)
            //循环条件
            while(startYear<endYear||(startYear===endYear&&startMonth<=endMonth)){
                var s_month = startYear+"-"+(startMonth<10?'0'+startMonth++:startMonth++)
                if(startMonth>12){
                    startMonth-=12
                    startYear++
                }
                var e_month = startYear+"-"+(startMonth<10?'0'+startMonth:startMonth)
                var finishCount = 0
                var finishDaysCount=0
                var onTimeFinishCount=0
                var planDaysCount=0
                this.allTaskList.forEach(s=>{
                    if(s.finishTime>=s_month&&s.finishTime<e_month){
                        finishCount++
                        finishDaysCount += s.executionDays
                        planDaysCount += s.planDays+s.unforcedDays
                        if(s.executionDays<=(s.planDays+s.unforcedDays))
                            onTimeFinishCount++
                    }
                })
                //插入数据
                this.barInfo.months.push(s_month)
                this.barInfo.finishCount.push(finishCount)
                this.barInfo.finishDaysCount.push(finishDaysCount)
                this.barInfo.taskAchieveRate.push(finishCount===0?0:(onTimeFinishCount*100.0/finishCount).toFixed(2))
                this.barInfo.timeAchieveRate.push(finishDaysCount===0?0:(planDaysCount*100.0/finishDaysCount).toFixed(2))    
            }
        },
        // 获取最大值方法
        calMax(arr) {
            var max = Math.max.apply(null, arr); // 获取最大值方法
            var maxint = Math.ceil(max / 5); // 向上以5的倍数取整
            var maxval = maxint * 5 + 5; // 最终设置的最大值
            return maxval; // 输出最大值
        },
        // 获取最小值方法
        calMin(arr) {
            var min = Math.min.apply(null, arr); // 获取最小值方法
            var minint = Math.floor(min / 1); // 向下以1的倍数取整
            var minval = minint * 1 - 5; // 最终设置的最小值
            return minval; // 输出最小值
        }
    }
}
</script>

<style lang="less" scoped>
.charts-area {
    width: 100%;
    display: flex;

    .el-card,
    .pie-charts {
        width: 30%;
        margin-right: 5px;
    }

    .bar-chart {
        width: 70%;
    }
}
</style>