import { getCaseList } from '@/api/case'
import { formatDate, getStatus } from '@/utils/common'

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

            if ("director" in obj)
                state.queryList = state.queryList.filter(item => item.director === obj.director)

            if ("startTime" in obj && "endTime" in obj)
                state.queryList = state.queryList.filter(item => (new Date(item.finishTime) >= new Date(obj.startTime)) && (new Date(item.finishTime) <= new Date(obj.endTime)))
        }
    },
    actions: {
        //获取专案列表
        async getCaseList(context, isFinished) {
            var res = await getCaseList(isFinished)
            res = res.data
            //数据加工
            for (let i = 0; i < res.length; i++) {
                //后端拿到的是字符串格式的数据，转换为时间格式
                const startTime = new Date(res[i]['startTime'])
                res[i].startTime = formatDate(startTime)
                if (res[i].finishTime !== null)
                    res[i].finishTime = formatDate(new Date(res[i]['finishTime']))
                //目标完成时间
                //开始时间+各个阶段的计划时间
                //必须new一个新的，否则共用一个对象，修改一个，两个都改了
                var presetTime = new Date(startTime)
                presetTime.setDate(presetTime.getDate() + res[i].planDay - 1)
                res[i].presetTime = formatDate(presetTime)

                //设置执行天数(2023.11.3 已经在后端完成计算)

                //显示当前阶段
                if (res[i].curStage === null)
                    res[i].curStage = "已结案"
            }

            // 获取的是执行中的专案，则按照执行天数倒序排序
            if (!isFinished) {
                res.sort((a, b) => {
                    return b.executionDays - a.executionDays
                })
            }else{
                // 获取的是已完成的专案，则按照完结时间倒序排序
                res.sort((a,b)=>{
                    return new Date(b.finishTime)-new Date(a.finishTime)
                })
            }
            context.commit('updateList', res)
        },



    },
    getters: {}
}