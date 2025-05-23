import { noticeList, checkNotice } from "@/api/notice"
import { Notification } from "element-ui"
import { formatTimestamp } from "@/utils/common"


const state = {
    noticeList:[]
}

export default {
    namespaced: true,
    state,
    mutations: {
        updateNoticeList(state,noticeList){
            if (state.noticeList.length < noticeList.length) {
                Notification({
                    title: '系统消息',
                    message: `系统收到了新的消息，目前有${noticeList.length}条消息待阅`,
                    type:'warning',
                    duration: 5000
                });
            }
            state.noticeList = noticeList 
        }
    },
    actions: {
        async getNoticeList(ctx){
            const {data:res} = await noticeList()
            for (let i = 0; i < res.length; i++) {
                res[i].createTime = formatTimestamp(parseInt(res[i].createAt))
                if(res[i].content.includes('\t'))
                    res[i].createName = res[i].content.split("\t")[0]
                else res[i].createName = res[i].content.split(" ")[0]
            }
            ctx.commit('updateNoticeList',res)
        },
        async checkMessage(ctx, row){
            row.status = 1
            const res = await checkNotice(row)
            return res
        }
    },
    getters: {}
}