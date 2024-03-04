<template>
    <div class="main-container">
        <div class="top-area">
            <el-card class="charts-container">
                <h4>专案图表</h4>
                <div id="barCharts" style="width:100%;height: 300px;"></div>
                <div style="display: flex;">
                    <div id="subCharts" style="width:50%;height: 300px;"></div>
                    <div id="caseCharts" style="width:50%;height: 300px;"></div>
                </div>
            </el-card>
            <el-card class="calendar-container">
                <h4>专案日历</h4>
                <!-- 日历显示 -->
                <el-calendar>
                    <template slot="dateCell" slot-scope="{data}">

                        <div style="width: 100%;height: 100%;font-size: 25px; text-align: center;line-height: 70px;"
                            :style="{ 'background-color': isFinishDay(data.day) ? 'skyblue' : isSunDay(data.day) ? '#5BEE58' : 'white' }">
                            <el-tooltip v-if="isFinishDay(data.day)" placement="top">
                                <template #content>
                                    <div v-html="tooltipContent(data.day)" style="font-size: 15px;"></div>
                                </template>
                                <p style="color:#F13E32">{{ CurformatDate(data.day) + '★' }}</p>
                            </el-tooltip>
                            <el-tooltip v-else-if="isToday(data.day)" content="就在今天!" placement="top">
                                <p>{{ CurformatDate(data.day) + '✔️' }}</p>
                            </el-tooltip>

                            <p v-else>
                                {{ CurformatDate(data.day) }}
                            </p>
                        </div>
                    </template>
                </el-calendar>
            </el-card>
        </div>
        <div class="table-container">
            <el-card class="executing-container">
                <el-row>
                    <el-col :span="4">
                        <h4><i class='el-icon-s-flag'></i>执行清单</h4>
                    </el-col>
                    <el-col :span="4" :offset="16">
                        <el-button type="danger" icon="el-icon-s-marketing" @click="openAddHolidayView">节假日延期</el-button>
                    </el-col>
                </el-row>
                <el-table :data="executingList" style="font-size: 15px;">
                    <el-table-column type="index" width="40"></el-table-column>
                    <el-table-column prop="caseName" label="专案" align="center" width="260"></el-table-column>
                    <el-table-column prop="subName" label="阶段" align="center"></el-table-column>
                    <el-table-column prop="userNames" label="负责人" width="220" align="center"></el-table-column>
                    <el-table-column prop="startTime" label="开始时间" align="center" width="100"></el-table-column>
                    <el-table-column>
                        <template slot-scope="scope">
                            <el-button icon="el-icon-position" type="primary" @click="redirectToDetailPage(scope.row)" round
                                size="mini"></el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-card>
            <div class="exception-container">
                <el-card class="delay-container">
                    <h4><i class='el-icon-error'></i>延误清单</h4>
                    <el-table :data="delayList">
                        <el-table-column type="index" width="40"></el-table-column>
                        <el-table-column prop="caseName" label="专案" width="250"></el-table-column>
                        <el-table-column prop="subName" label="阶段"></el-table-column>
                        <el-table-column prop="userNames" label="负责人"></el-table-column>
                        <el-table-column prop="delayDays" label="已延期(天)"></el-table-column>
                        <el-table-column>
                            <template slot-scope="scope">
                                <el-button icon="el-icon-position" type="danger" @click="redirectToDetailPage(scope.row)"
                                    round size="mini"></el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-card>
                <el-card class="pause-container">
                    <h4><i class='el-icon-video-pause'></i>暂停清单</h4>
                    <el-table :data="pausingList">
                        <el-table-column type="index" width="40"></el-table-column>
                        <el-table-column prop="caseName" label="专案" width="250"></el-table-column>
                        <el-table-column prop="subName" label="阶段"></el-table-column>
                        <el-table-column prop="userNames" label="负责人" width="150"></el-table-column>
                        <el-table-column prop="pauseStart" label="暂停于" width="100"></el-table-column>
                        <el-table-column label="已暂停">
                            <template slot-scope="scope">
                                {{ `${scope.row.pauseDays} 天` }}
                            </template>
                        </el-table-column>
                        <el-table-column>
                            <template slot-scope="scope">
                                <el-tooltip class="item" effect="dark" :content="scope.row.pauseDesc" placement="top">
                                    <el-button icon="el-icon-position" type="info" @click="redirectToDetailPage(scope.row)"
                                        round size="mini"></el-button>
                                </el-tooltip>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-card>
            </div>
        </div>
        <el-dialog title="填写假期信息" :visible.sync="holidayDelayVisible" width="30%">
            <el-form :model="holidayDelayForm" label-width="100px">
                <el-form-item label="放假时间(天)">
                    <el-input type="number" v-model="holidayDelayForm.holiday" placeholder="请输入放假天数"></el-input>
                </el-form-item>
                <el-form-item label="假期描述">
                    <el-input placeholder="请说明放假类型" v-model="holidayDelayForm.holidayDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="holidayDelayVisible = false">取 消</el-button>
                <el-button type="primary" @click="addHolidayDelay">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>



<style scoped>
/* 主框架flex显示 */
.main-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
}

.top-area {
    width: 100%;
    height: 700px;
    display: flex;
    align-items: stretch;
    /* 使两侧高度相等 */
    margin-bottom: 1%;
}

.charts-container {
    width: 52%;
    margin-right: 1%;
}

/* 日历部分 */
.calendar-container {
    width: 47%;
}

.el-calendar {
    transform: scaleY(0.95);
    transform-origin: top right;
}

/* 下方表格部分 */
.table-container {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}

.executing-container {
    width: 50%;
    margin-right: 1%;
}

.exception-container {
    width: 49%;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
}

.delay-container {
    margin-bottom: 10px;
}
</style>


<script>
import { formatDate, timeAdd, timeSub } from '@/utils/common';
import { getExecuting, getHalfYearFinishCaseSubAmount } from '@/api/caseSub';
import {addHolidayDelay} from '@/api/caseDelayApply';
import { getCaseList } from '@/api/case';
import { mapState } from 'vuex';

export default {
    name: 'admin-index',
    data() {
        return {
            executingList: [],
            delayList: [],
            pausingList: [],
            caseSubCount: 0,
            caseCount: 0,
            barCharts: null,
            caseSubFinishInfo: [],
            caseCharts: null,
            caseExecutingInfo: [],
            subCharts: null,
            subExecutingInfo: [],
            casePieObj: {
                executing: 0,
                notStart: 0,
                interrupt: 0,
                delay: 0
            },
            holidayDelayVisible: false,
            holidayDelayForm: {
                holiday: 0,
                holidayDesc: '',
                // 用于假期申请检查计数
                checkCount: 0
            }
        }
    },
    async created() {
        await this.getExecutingList()
        await this.getHalfYearFinishCaseSubAmount()
        await this.getCaseList()
        this.barCharts = this.$echarts.init(document.getElementById('barCharts'))
        this.subCharts = this.$echarts.init(document.getElementById('subCharts'))
        this.caseCharts = this.$echarts.init(document.getElementById('caseCharts'))
        this.initBar()
        this.initSubPie()
        this.initCasePie()
    },
    computed: {
        ...mapState('apply', ['subList'])
    },
    methods: {
        async getHalfYearFinishCaseSubAmount() {
            const res = await getHalfYearFinishCaseSubAmount()
            this.caseSubFinishInfo = res.data
            console.log(this.caseSubFinishInfo)
        },
        initBar() {
            var option = {
                title: {
                    text: '近半年完成子流程统计'
                },
                xAxis: {
                    axisLabel: {
                        fontSize: 15,
                    },
                    data: this.caseSubFinishInfo.map(item => item.date)
                },
                yAxis: {},
                grid: {
                    containLabel: true,
                    show: false,
                    left: 0,
                    right: 0
                },
                tooltip: {
                    trigger: "axis",
                    formatter: function (params) {
                        var res = '<div style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:' + params[0].color + ';"></div>'
                        res += params[0].axisValue + '月完成' + params[0].value + '项'
                        return res
                    }
                },
                series: [
                    {
                        type: 'bar',
                        data: this.caseSubFinishInfo.map(item => item.amount),
                    },
                    {
                        type: 'line',
                        data: this.caseSubFinishInfo.map(item => item.amount),
                        label:
                        {
                            show: true,
                            fontSize: 15,
                        }
                    }
                ]
            }
            this.barCharts.setOption(option)
            this.barCharts.on('click', async (params) => {
                let [year, month] = params.name.split('-')
                this.$router.push({
                    name: '月报分析',
                    query: {
                        year: +year,
                        month: +month
                    }
                })
            })
        },
        initSubPie() {
            var option = {
                title: {
                    text: `阶段执行状况总览(${this.caseSubCount}项)`,
                },
                grid: {
                    containLabel: true,
                    show: false,
                    top: 0,
                    left: 0
                },
                tooltip: {
                    trigger: 'item',
                    textStyle: {
                        fontSize: 18
                    },
                    formatter: function (params) {
                        var res = ''
                        res += params.name + ': ' + params.value + "项,占比" + params.percent + '% '
                        return res
                    }
                },
                series: [
                    {
                        type: 'pie',
                        radius: ['50%', '70%'],
                        data: [{ name: '正在执行', value: this.executingList.length },
                        { name: '延误', value: this.delayList.length },
                        { name: '暂停', value: this.pausingList.length }],
                        label: {
                            show: true,
                            fontSize: 15
                        },
                        itemStyle: {
                            color: function (params) {
                                if (params.data.name === "正在执行")
                                    return '#7EDB4B'
                                else if (params.data.name === "延误")
                                    return '#D73B0F'
                                else if (params.data.name === "暂停")
                                    return '#7A929C'
                            }
                        },
                    }
                ]
            }
            this.subCharts.setOption(option)
        },
        //获取专案列表
        async getCaseList() {
            var res = await getCaseList(false)
            this.caseExecutingInfo = res.data
            this.caseCount = this.caseExecutingInfo.length
            for (var i = 0; i < this.caseExecutingInfo.length; i++) {
                if (this.caseExecutingInfo[i].startTime === null) {
                    this.casePieObj.notStart++
                } else if (this.isInterrupt(this.caseExecutingInfo[i])) {
                    this.casePieObj.interrupt++
                } else if (this.caseExecutingInfo[i].executionDays > this.caseExecutingInfo[i].planDay) {
                    this.casePieObj.delay++
                } else {
                    this.casePieObj.executing++
                }
            }
        },
        isInterrupt(row) {
            for (var i = 0; i < this.subList.length; i++) {
                if (row.name === this.subList[i].caseName)
                    return true
            }
            return false
        },
        initCasePie() {
            var option = {
                title: {
                    text: `专案执行状况总览(${this.caseCount}项)`,
                },
                grid: {
                    containLabel: true,
                    show: false,
                    top: 0,
                    left: 0
                },
                tooltip: {
                    trigger: 'item',
                    textStyle: {
                        fontSize: 18
                    },
                    formatter: function (params) {
                        var res = ''
                        res += params.name + ': ' + params.value + "项,占比" + params.percent + '% '
                        return res
                    }
                },
                series: [
                    {
                        type: 'pie',
                        radius: ['50%', '70%'],
                        data: [{ name: '正在执行', value: this.casePieObj.executing },
                        { name: '延误', value: this.casePieObj.delay },
                        { name: '中断', value: this.casePieObj.interrupt },
                        { name: '未开始', value: this.casePieObj.notStart }],
                        label: {
                            show: true,
                            fontSize: 15
                        },
                        itemStyle: {
                            color: function (params) {
                                if (params.data.name === "正在执行")
                                    return '#2c7be5'
                                else if (params.data.name === "延误")
                                    return '#D73B0F'
                                else if (params.data.name === "中断")
                                    return '#ff8c44'
                                else if (params.data.name === "未开始")
                                    return '#27bcfd'
                            }
                        },
                    }
                ]
            }
            this.caseCharts.setOption(option)
        },

        async getExecutingList() {

            // 初始化另外两个数组
            this.pausingList = []
            this.delayList = []

            const res = await getExecuting()
            

            this.executingList = res.data
            this.caseSubCount = this.executingList.length
            this.executingList.forEach(item => {
                item.presetTime = timeAdd(item.startTime, item.planDays, +item.unforcedDays, +item.applyDelay)
                if (item.pausing) {
                    item.pauseStart = formatDate(item.pauseStart)
                    item.pauseDays = timeSub(item.pauseStart, new Date())
                    this.pausingList.push(item)
                }
                else if (item.presetTime < formatDate(new Date())) {
                    // 延期时间
                    item.delayDays = timeSub(item.presetTime, new Date()) - 1
                    this.delayList.push(item)
                }
            })
            // 正在执行的专案里面移除暂停的
            this.executingList = this.executingList.filter(item => !item.pausing)
            // 正在执行的专案里面移除延期的
            this.executingList = this.executingList.filter(item => item.presetTime >= formatDate(new Date()))
            // 对执行专案进行排序，按照开始时间倒序
            this.executingList.sort((a, b) => {
                return new Date(b.startTime) - new Date(a.startTime)
            })
            // 对暂停专案按照暂停时间倒序
            this.pausingList.sort((a, b) => {
                return b.pauseDays - a.pauseDays
            })
            // 对延期专案按照延期时间倒序
            this.delayList.sort((a, b) => {
                return b.delayDays - a.delayDays
            })
        },
        // 跳转到详情页
        redirectToDetailPage(row) {
            this.$router.push({
                name: '子流程详情',
                query: {
                    caseId: row.caseId,
                    caseName: row.caseName
                }
            })
        },

        // 日历相关方法
        isSunDay(date) {
            date = new Date(date)
            return date.getDay() === 0
        },
        // 当前页面的格式化日期函数
        CurformatDate(date) {
            var array = date.split("-")
            if (+array[2] === 1)
                return array[1] + "月"
            else
                return +array[2]
        },
        isToday(date) {
            const today = new Date().toISOString().slice(0, 10);
            return date === today
        },
        isFinishDay(date) {
            var str = ''
            for (let i = 0; i < this.executingList.length; i++) {
                if (timeAdd(this.executingList[i].presetTime) === date) {
                    str += this.executingList[i].description
                    str += '\n'
                }
            }
            return str
        },
        tooltipContent(day) {
            const content = this.isFinishDay(day);
            // 把换行符转换成 <br> 标签
            return content.replace(/\n/g, '<br>');
        },
        openAddHolidayView() {
            // 初始化假期对象
            this.holidayDelayForm = {
                holiday: 0,
                holidayDesc: '',
                // 用于假期申请检查计数
                checkCount: 0
            }
            this.holidayDelayVisible = true
        },
        async addHolidayDelay() {
            if(this.holidayDelayForm.holiday <= 0||this.holidayDelayForm.holidayDesc.trim()===''){
                this.$message.error("放假时间非法或放假描述为空，请检查输入")
                return;
            }
            if (this.holidayDelayForm.checkCount < 1) {
                this.$message({
                    type:'warning',
                    message:"请再次确认信息是否正确!",
                    duration:5000,
                })
                this.holidayDelayForm.checkCount++
                return;
            }
            const res = await addHolidayDelay({holiday:this.holidayDelayForm.holiday, holidayDesc:this.holidayDelayForm.holidayDesc.trim()})
            this.$message.success(res.data)
            this.holidayDelayVisible = false
            await this.getExecutingList()
            await this.getHalfYearFinishCaseSubAmount()
            await this.getCaseList()
        }
    }
}
</script>
