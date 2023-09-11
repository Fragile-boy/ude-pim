import service from "@/plugins/service";
//统计一个专案子流程有多少个负责人
//申请完结的时候判断有几个负责人，手动开始判断是否有负责人，分配比例这三个地方使用
export const countUser = (caseSubId) => {
    return service.get(`/caseSubUser/countDirector/${caseSubId}`)
}

//移除负责人
export const removeDirector = (obj) => {
    return service.delete(`/caseSubUser`, { params: obj })
}

//添加负责人
export const setDirector = (obj) => {
    return service.post('/caseSubUser/setDirector', obj)
}

// 完结状态，并赋值积分比例
export const submitDirectorValue = (obj) => {
    return service.put('/caseSubUser/submitDirectorValue', obj)
}

//修改或者添加任务描述
export const updateDescription=(obj)=>{
    return service.put('/caseSubUser/updateDescription',obj)
}