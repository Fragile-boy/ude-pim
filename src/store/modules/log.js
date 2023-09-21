import { logList,checkLog } from "@/api/log"



const state = {
    logList:[]
}

export default {
    namespaced: true,
    state,
    mutations: {
        updateLogList(state,logList){
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