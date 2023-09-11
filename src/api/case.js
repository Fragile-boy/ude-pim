import service from "@/plugins/service"

// 返回专案综合信息列表
export const getCaseList = () => {
    return service.get('case/dtoList')
}

// 返回专案列表
export const getList = (obj) => {
    return service.get('case/list', { params: obj })
}

// 新增专案
export const addCase = (caseObj) => {
    return service.post('case', caseObj)
}

// 修改专案
export const editCase = (caseObj) => {
    return service.put('case', caseObj)
}

//返回专案朴素信息
export const getById = (id)=>{
    return service.get(`/case/${id}`)
}

// 删除专案
export const deleteCase= (id)=>{
    return service.delete(`/case/${id}`)
}

//获取所有未完成的专案列表
export const unFinishedCaseList = ()=>{
    return service.get("/case/unFinishedCaseList")
}