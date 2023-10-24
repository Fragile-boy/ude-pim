import service from "@/plugins/service";

export const saveFinishApply = (obj)=>{
    return service.post('/caseSubFinishApply/applyFinish',obj)
}

export const getFinishApplyList = (obj)=>{
    return service.get('/caseSubFinishApply/checkList')
}

export const judgeFinishApply = (obj)=>{
    return service.put('/caseSubFinishApply/judgeApply',obj)
}

export const endHistory = (obj)=>{
    return service.get('/caseSubFinishApply/history',{params:obj})
}

//根据id获取正在申请的完结列表
export const getFinishListByUserId = (id)=>{
    return service.get(`/caseSubFinishApply/checkList/${id}`)
}

export const removeFinishApply = (id)=>{
    return service.delete(`/caseSubFinishApply/removeFinishApply/${id}`)
}