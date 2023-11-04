import service from "@/plugins/service"

//根据专案id获取专案子流程列表(仅在获取专案下子流程详情会被调用)
export const getSubList = (caseId)=>{
    return service.get(`caseSub/list/${caseId}`)
}

//根据专案id获取以负责人为基本单位的列表数据
export const listFocusPerson = (caseId)=>{
    return service.get(`caseSub/listFocusPerson/${caseId}`)
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

//编辑专用api
export const updateCaseSub=(obj)=>{
    return service.put('/caseSub/updateCaseSub',obj)
}

// 开始或者结束api
export const startOrFinish=(obj)=>{
    return service.put('/caseSub/startOrFinish',obj)
}


//获取专案id下，非userId负责的，所有尚未完成的子流程
export const unfinishedSubList=(obj)=>{
    return service.get(`/caseSub/unfinishedSubList`,{params:obj})
}

//数据分析调用接口，获取当月所有完成的子流程
export const analysis=(obj)=>{
    return service.get("/caseSub/analysis",{params:obj})
}

//计划完成的总数
export const planFinishCount=(obj)=>{
    return service.get("/caseSub/planFinishCount",{params:obj})
}

//根据专案子流程id获取专案id
export const getCaseId = (id) => {
    return service.get(`/caseSub/${id}`)
}

// 插入子流程
export const insertCaseSub = (obj)=>{
    return service.post('/caseSub/insertCaseSub',obj)
}

// 删除子流程
export const removeCaseSub = (obj)=>{
    return service.put('/caseSub/removeCaseSub',obj)
}

// 修改专案子流程顺序
export const updateCaseSubSort = (obj)=>{
    return service.put('/caseSub/updateCaseSubSort', obj)
}