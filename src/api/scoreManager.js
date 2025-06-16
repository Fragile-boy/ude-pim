import service from "@/plugins/service";

export const getList=(obj)=>{
    return service.get('/score-records/list', {params:obj})
}

export const addRecord=(obj)=>{
    return service.post('/score-records', obj)
}

