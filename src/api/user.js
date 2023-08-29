import service from "@/plugins/service";

//获得所有用户
export const getUserList = ()=>{
    return service.get('/user/list')
}

//获得用户页面数据
export const getUserPage = (obj)=>{
    return service.get('/user/page',{params: obj})
}

export const saveUser = (obj)=>{
    return service.post('/user',obj)
}

export const getUserById = (id)=>{
    return service.get(`/user/${id}`)
}

export const updateUser= (obj)=>{
    return service.put('/user',obj)
}

export const removeUser = (id)=>{
    return service.delete(`/user/${id}`)
}