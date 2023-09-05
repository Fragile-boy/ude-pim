import service from "@/plugins/service";
//统计一个专案子流程有多少个负责人
export const countUser = (caseSubId) => {
    return service.get(`/caseSubUser/countDirector/${caseSubId}`)
}

//移除负责人
export const removeDirector = (obj) => {
    return service.delete(`/caseSubUser`, {params:obj})
}

//添加负责人
export const setDirector = (obj) => {
    return service.post('/caseSubUser/setDirector', obj)
}