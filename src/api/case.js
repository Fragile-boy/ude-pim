import service from "@/plugins/service"

// 返回专案列表
export const getCaseList = ()=>{
    return service.get('case/list')
}