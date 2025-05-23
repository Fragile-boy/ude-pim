import { getReplyCount } from "@/api/notice"
import { Notification } from "element-ui"


const state = {
    relativeObject: [],
}

export default {
    namespaced: true,
    state,
    mutations: {
        updateReplyCount(state, replyCount) {
            if (state.relativeObject.length < replyCount.length) {
                Notification({
                    title: '最新回复',
                    message: `你的问题或评论共收到${replyCount.length}条最新评论`,
                    type: 'success',
                    duration: 5000
                });
            }
            
            state.relativeObject = replyCount
        }
    },
    actions: {
        async getReplyCount(ctx) {
            const res = await getReplyCount()
            if (res.code === 200)
                ctx.commit('updateReplyCount', res.data)
        }
    },
    getters: {}
}