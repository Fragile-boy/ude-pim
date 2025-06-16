import service from "@/plugins/service";

export const addCaseClosureInfo = (obj)=>{
    return service.post('/caseClosureInfo',obj)
}

export const updateCaseClosureInfo = (obj)=>{
    return service.put('/caseClosureInfo',obj)
}

export const getClosureInfoByCaseId = (caseId)=>{
    return service.get(`/caseClosureInfo/by-case/${caseId}`)
}

export const getUserScore = (caseId)=>{
    return service.get(`/caseClosureInfo/getUserScore/${caseId}`)
}