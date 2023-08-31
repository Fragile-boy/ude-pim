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
    return service.post('/sub', obj)
}

// 修改保存子流程
export const updateSub = (obj)=>{
    return service.put('/sub', obj)
}

//获取子流程特定难度的对应的计划天数
export const getPresetDays = (obj)=>{
    return service.get('/subLevel/getPresetDays', {params:obj})
}