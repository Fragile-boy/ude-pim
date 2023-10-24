import service from "@/plugins/service";

export const saveApply = (params) => {
    return service.post('/caseSubDelayApply', params)
}


export const getApplyList = () => {
    return service.get('/caseSubDelayApply/checkList')
}

export const judgeApply = (params) => {
    return service.put('/caseSubDelayApply/judgeApply', params)
}

export const getDelayByStatus = (params) => {
    return service.get('/caseSubDelayApply/byUserAndStatus', {params:params})
}

export const delayHistory = (obj)=>{
    return service.get('/caseSubDelayApply/history',{params:obj})
}

//根据id获取正在申请的延期列表
export const getDelayListByUserId = (id)=>{
    return service.get(`/caseSubDelayApply/checkList/${id}`)
}

export const updateDelay = (obj)=>{
    return service.put(`/caseSubDelayApply/updateDelay`,obj)
}

export const deleteDelay = (id)=>{
    return service.delete(`/caseSubDelayApply/${id}`)
}

export const removeDelayApply = (id)=>{
    return service.delete(`/caseSubDelayApply/removeDelayApply/${id}`)
}