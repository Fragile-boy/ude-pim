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