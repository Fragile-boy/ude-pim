import service from "@/plugins/service";

export const addComment=(obj)=>{
    return service.post('issuesComment',obj)
}

export const deleteById=(id)=>{
    return service.delete(`issuesComment/${id}`)
}