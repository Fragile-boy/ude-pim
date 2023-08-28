import service from "@/plugins/service";

export const getUserList = ()=>{
    return service.get('/user/list')
}