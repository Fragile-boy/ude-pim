import service from "@/plugins/service";

export const saveFinishApply = (obj)=>{
    return service.post('/caseSubFinishApply/applyFinish',obj)
}

export const getFinishApplyList = (obj)=>{
    return service.get('/caseSubFinishApply/checkList')
}

export const judgeFinishApply = (obj)=>{
    return service.put('/caseSubFinishApply/judgeApply',obj)
}