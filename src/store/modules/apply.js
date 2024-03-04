import { exceptionSub } from "@/api/caseSub"
import { getApplyList } from '@/api/caseDelayApply'
import { getFinishApplyList } from "@/api/caseFinishApply"
import { applyList } from "@/api/applyCaseSub"
import { applyTaskList } from "@/api/applyTask"
import { formatDate, timeAdd } from "@/utils/common"
import { Notification } from 'element-ui'

export default {
    namespaced: true,
    state: {
        //异常专案阶段
        subList: [],
        //延期申请
        delayList: [],
        //完结申请
        finishList: [],
        caseSubList: [],
        taskList: []
    },
    mutations: {
        //更新异常阶段列表
        updateSubList(state, payLoad) {
            state.subList = payLoad
        },
        //更新延期列表
        updateDelayList(state, payLoad) {
            if (state.delayList.length < payLoad.length) {
                Notification({
                    title: '延期申请',
                    message: `系统收到了新的延期申请，目前有${payLoad.length}条申请待审核`,
                    type:'warning',
                    duration: 3500
                });
            }
            state.delayList = payLoad
        },
        //更新完结列表
        updateFinishList(state, payLoad) {
            if (state.finishList.length < payLoad.length) {
                Notification({
                    title: '完结申请',
                    message: `系统收到了新的完结申请，目前有${payLoad.length}条申请待审核`,
                    type:'warning',
                    duration: 3500
                });
            }
            state.finishList = payLoad
        },
        updateCaseSubList(state, payLoad) {
            if (state.caseSubList.length < payLoad.length) {
                Notification({
                    title: '专案类申请',
                    message: `系统收到了新的专案类申请，目前有${payLoad.length}条申请待审核`,
                    type:'warning',
                    duration: 3500
                });
            }
            state.caseSubList = payLoad
        },
        updateTaskList(state, payLoad) {
            if (state.taskList.length < payLoad.length) {
                Notification({
                    title: '任务申请',
                    message: `系统收到了新的任务申请，目前有${payLoad.length}条申请待审核`,
                    type:'warning',
                    duration: 3500
                });
            }
            state.taskList = payLoad
        }

    },
    actions: {
        //获得异常阶段列表
        async exceptionSub(ctx) {
            const res = await exceptionSub()
            ctx.commit('updateSubList', res.data)
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
            res.data.forEach(item => {
                try {

                    item.estimateValue = item.estimateValue===null?null:item.estimateValue.toFixed(2)
                } catch (error) {
                    item.estimateValue = "错误！"
                }
            })
            ctx.commit('updateFinishList', res.data)
        },
        async getCaseSubApplyList(ctx) {
            const res = await applyList()
            ctx.commit('updateCaseSubList', res.data)
        },
        async getTaskList(ctx) {
            const res = await applyTaskList()
            res.data.forEach(item => item.predictTime = timeAdd(item.createTime, item.planDays))
            ctx.commit('updateTaskList', res.data)
        },
    }
}