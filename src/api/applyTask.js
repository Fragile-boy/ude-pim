import service from "@/plugins/service";

export const saveApplyTask = (obj)=>{
    return service.post('/applyTask/saveApplyTask',obj)
}

export const applyTaskList=()=>{
    return service.get('/applyTask/applyList')
}

export const judgeApply=(obj)=>{
    return service.put('/applyTask/judgeApply',obj)
}


export const applyHistoryList = (obj)=>{
    return service.get('/applyTask/applyHistoryList',{params:obj})
}

export const checkingApplyTask = (id)=>{
    return service.get('/applyTask/checkingApply/'+id)
}

export const removeTaskApply = (id)=>{
    return service.delete(`/applyTask/removeTaskApply/${id}`)
}
