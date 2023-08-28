import service from "@/plugins/service";

export const getUserList = (obj)=>{
    return service.get('/user/list',{params: obj})
}