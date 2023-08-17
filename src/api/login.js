import service from "@/plugins/service";

// 登录
export const loginApi = (params)=> {
    return service.post('/user/login',params)
}

export const logout = ()=>{
    return service.post('/user/logout')
}