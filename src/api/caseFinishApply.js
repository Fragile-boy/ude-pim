import service from "@/plugins/service";

export const saveFinishApply = (obj)=>{
    return service.post('/caseSubFinishApply/applyFinish',obj)
}