import service from "@/plugins/service"

//根据专案id获取专案子流程列表
export const getSubList = (caseId)=>{
    return service.get(`caseSub/list/${caseId}`)
}

//根据科员id获取其未完成的子流程列表
export const getSubByUserId = (userId)=>{
    return service.get(`/caseSub/director/${userId}`)
}

//插入数据
export const insertRelation = (obj)=>{
    return service.post('/caseSub/saveRelation',obj)
}

//获得异常子流程
export const exceptionSub = ()=>{
    return service.get('/caseSub/exceptionSub')
}

export const updateCaseSub=(obj)=>{
    return service.put('/caseSub/updateCaseSub',obj)
}