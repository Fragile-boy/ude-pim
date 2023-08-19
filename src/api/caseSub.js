import service from "@/plugins/service"

//根据专案id获取专案子流程列表
export const getSubList = (caseId)=>{
    return service.get(`caseSub/list/${caseId}`)
}

//根据科员id获取其未完成的子流程列表
export const getSubByUserId = (userId)=>{
    return service.get(`/caseSub/director/${userId}`)
}