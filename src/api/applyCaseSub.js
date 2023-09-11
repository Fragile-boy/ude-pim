import service from "@/plugins/service";

export const saveApplyCaseSub=(obj)=>{
    return service.post('/applyCaseSub/saveApplyCaseSub',obj)
}