import { getUserList } from '@/api/user'

export default {
    namespaced: true,
    state(){
        return{
            userList:[]
        }
    },
    mutations:{
        setUserList(state,userList){
            state.userList = userList
        }
    },
    actions:{
        async getUserList(context){
            const res = await getUserList()
            if(res.code===200)
                context.commit('setUserList',res.data)
        }
    },
    getters: {}
}