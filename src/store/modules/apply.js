import { exceptionSub } from "@/api/caseSub"
import {getApplyList} from '@/api/caseDelayApply'
import { getFinishApplyList } from "@/api/caseFinishApply"
import { applyList } from "@/api/applyCaseSub"
import { applyTaskList } from "@/api/applyTask"
import { formatDate,timeAdd } from "@/utils/common"

export default{
    namespaced:true,
    state:{
        //异常专案阶段
        subList:[],
        //延期申请
        delayList:[],
        //完结申请
        finishList:[],
        caseSubList:[],
        taskList:[]
    },
    mutations:{
        //更新异常阶段列表
        updateSubList(state, payLoad){
            state.subList = payLoad
        },
        //更新延期列表
        updateDelayList(state,payLoad){
            state.delayList = payLoad
        },
        //更新完结列表
        updateFinishList(state, payLoad){
            state.finishList = payLoad
        },
        updateCaseSubList(state,payLoad){
            state.caseSubList = payLoad
        },
        updateTaskList(state,payLoad){
            state.taskList = payLoad
        }

    },
    actions:{
        //获得异常阶段列表
        async exceptionSub(ctx) {
            const res = await exceptionSub()
            ctx.commit('updateSubList',res.data)
        },
        //获得延期阶段列表
        async getDelay(ctx) {
            var res = await getApplyList()
            res.data.map(item => {
                item.applyTime = formatDate(item.createTime)
                item.formatPredictTime = formatDate(item.predictTime)
            })
            ctx.commit('updateDelayList', res.data)
        },
        //获得完结申请列表
        async getFinish(ctx) {
            var res = await getFinishApplyList()
            ctx.commit('updateFinishList', res.data)
        },
        async getCaseSubApplyList(ctx) {
            const res = await applyList()
            ctx.commit('updateCaseSubList',res.data)
        },
        async getTaskList(ctx) {
            const res = await applyTaskList()
            res.data.forEach(item => item.predictTime = timeAdd(item.createTime, item.planDays))
            ctx.commit('updateTaskList',res.data)
        },
    }
}