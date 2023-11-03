import { logList,checkLog } from "@/api/log"
import { Notification } from "element-ui"


const state = {
    logList:[]
}

export default {
    namespaced: true,
    state,
    mutations: {
        updateLogList(state,logList){
            if (state.logList.length < logList.length) {
                Notification({
                    title: '系统消息',
                    message: `系统收到了新的消息，目前有${logList.length-state.logList.length}条消息待阅`,
                    type:'warning',
                    duration: 0
                });
            }
            state.logList = logList 
        }
    },
    actions: {
        async getLogList(ctx){
            const res = await logList()
            ctx.commit('updateLogList',res.data)
        },
        async checkMessage(ctx, row){
            row.status = 1
            const res = await checkLog(row)
            return res
        }
    },
    getters: {}
}