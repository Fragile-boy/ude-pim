import service from "@/plugins/service"

// 返回专案综合信息列表
export const getCaseList = () => {
    return service.get('case/dtoList')
}

// 返回专案列表
export const getList = () => {
    return service.get('case/list')
}

// 新增专案
export const addCase = (caseObj) => {
    return service.post('case', caseObj)
}