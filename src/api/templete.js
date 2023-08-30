import service from "@/plugins/service";

//保存
export const saveTemplete = (obj)=>{
    return service.post('/subTemplete',obj)
}


export const getRelationId = (id)=>{
    return service.get(`/subTemplete/${id}`)
}

//获取分页数据
export const getTempleteList = (obj)=>{
    return service.get('/templete/list',{params:obj})
}

export const updateTemplete=(obj)=>{
    return service.put('/subTemplete',obj)
}