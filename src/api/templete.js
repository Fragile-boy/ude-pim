import service from "@/plugins/service";

//保存
export const saveTemplete = (obj)=>{
    return service.post('/subTemplate',obj)
}


export const getRelationId = (id)=>{
    return service.get(`/subTemplate/${id}`)
}

//获取分页数据
export const getTempleteList = (obj)=>{
    return service.get('/template/list',{params:obj})
}

//修改模板
export const updateTemplete=(obj)=>{
    return service.put('/subTemplate',obj)
}

// 删除模板
export const removeTemplete=(id)=>{
    return service.delete(`/subTemplate/${id}`)
}

