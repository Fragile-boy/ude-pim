import service from "@/plugins/service";

export const saveApplyTask = (obj)=>{
    return service.post('/applyTask/saveApplyTask',obj)
}