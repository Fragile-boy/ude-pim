import { getCaseList } from '@/api/case'
import { formatDate, getStatus } from '@/utils/common'
import { Message } from 'element-ui'

export default {
    namespaced: true,
    state() {
        return {
            caseList: [],
            queryList: []
        }
    },
    mutations: {
        updateList(state, newList) {
            state.caseList = newList
        },
        //获取查询后的专案列表
        queryCase(state, obj) {
            state.queryList = state.caseList
            if ("name" in obj)
                state.queryList = state.queryList.filter(item => item.name.includes(obj.name))

            if ("status" in obj)
                state.queryList = state.queryList.filter(item => item.status === obj.status)

            if ("startTime" in obj)
                state.queryList = state.queryList.filter(item => (new Date(obj.startTime[0]) <= new Date(item.startTime)) && (new Date(obj.startTime[1]) >= new Date(item.startTime)))

            if ("endTime" in obj)
                state.queryList = state.queryList.filter(item => item.finishTime !== null && (new Date(obj.endTime[0]) <= new Date(item.finishTime)) && (new Date(obj.endTime[1]) >= new Date(item.finishTime)))
        }
    },
    actions: {
        //获取专案列表
        async getCaseList(context) {
            var res = await getCaseList()
            res = res.data
            //数据加工
            for (let i = 0; i < res.length; i++) {
                //后端拿到的是字符串格式的数据，转换为时间格式
                const startTime = new Date(res[i]['startTime'])
                res[i].startTime = formatDate(startTime)
                //获得今天的日期，用于计算执行天数（如果已经完成，则执行天数由结束之间-开始时间获得）
                const today = new Date()
                //目标完成时间
                //开始时间+各个阶段的计划时间
                //必须new一个新的，否则共用一个对象，修改一个，两个都改了
                var presetTime = new Date(startTime)
                presetTime.setDate(presetTime.getDate() + res[i].planDay)
                res[i].presetTime = formatDate(presetTime)

                //设置执行天数

                // 如果案子还没有完结
                if (res[i].finishTime === null) {
                    //今天的时间-开始时间 获得已经执行的时间
                    var doingDay = Math.ceil((today - startTime) / (3600 * 24 * 1000))
                    res[i]['doingDay'] = doingDay

                } else {
                    //案子已经完结
                    var doingDay = Math.ceil((new Date(res[i].finishTime) - startTime) / (3600 * 24 * 1000))
                    res[i]['doingDay'] = doingDay
                    res[i].finishTime = formatDate(res[i].finishTime)
                }

                //显示当前阶段
                if (res[i].curStage === null)
                    res[i].curStage = "已结案"

                //执行状态显示
                // 如果案子还没有完结
                res[i].status = getStatus(res[i].startTime, res[i].presetTime, res[i].finishTime)
            }

            context.commit('updateList', res)
        },



    },
    getters: {}
}