import service from "@/plugins/service";

export const getAllSub = ()=>{
    return service.get('/sub/all')
}


//获取分页数据
export const getSubList = (obj)=>{
    return service.get('/sub/list', {params:obj})
}

//保存子流程
export const saveSub = (obj)=>{
    return service.post('/subLevel', obj)
}

// 修改保存子流程
export const updateSub = (obj)=>{
    return service.put('/subLevel', obj)
}

//获取子流程特定难度的对应的计划天数
export const getPresetDay = (obj)=>{
    return service.get('/subLevel/getPresetDays', {params:obj})
}

//删除子流程
export const deleteSubWithLevel = (id)=>{
    return service.delete(`/subLevel/${id}`)
}

//获取子流程的带计划天数信息
export const getSubWithLevel = (id)=>{
    return service.get(`/subLevel/${id}`)
}