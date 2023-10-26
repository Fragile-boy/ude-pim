import service from "@/plugins/service";

//获得所有用户(电控和机构)
export const getUserList = () => {
    return service.get('/user/list')
}

// 获得所有用户（并包括助理）
export const getUserListWithAssistants = () => {
    return service.get('/user/userListWithAssistants')
}

//获得用户页面数据
export const getUserPage = (obj) => {
    return service.get('/user/page', { params: obj })
}

export const saveUser = (obj) => {
    return service.post('/user', obj)
}

export const getUserById = (id) => {
    return service.get(`/user/${id}`)
}

export const updateUser = (obj) => {
    return service.put('/user', obj)
}

export const removeUser = (id) => {
    return service.delete(`/user/${id}`)
}

export const getUserStatus = (id) => {
    return service.get(`user/${id}/status`);
}

export const updatePassword = (obj) => {
    return service.put('/user/password', obj)
}


