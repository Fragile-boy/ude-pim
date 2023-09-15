import service from "@/plugins/service";

export const saveApplyCaseSub=(obj)=>{
    return service.post('/applyCaseSub/saveApplyCaseSub',obj)
}

export const applyList = ()=>{
    return service.get('/applyCaseSub/applyList')
}

export const judgeApply = (obj)=>{
    return service.put('/applyCaseSub/judgeApply',obj)
}

export const applyHistoryList = (obj)=>{
    return service.get('/applyCaseSub/applyHistoryList',{params:obj})
}