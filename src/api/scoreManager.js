import service from "@/plugins/service";

export const getList=(obj)=>{
    return service.get('/score-records/list', {params:obj})
}

export const addRecord=(obj)=>{
    return service.post('/score-records', obj)
}

export const deleteRecord=(id)=>{
    return service.delete('/score-records/'+id)
}

export const editRecord=(obj)=>{
    return service.put('/score-records', obj)
}