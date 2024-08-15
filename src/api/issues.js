import service from "@/plugins/service";

export const getList=()=>{
    return service.get('issues/list')
}

export const getIssueById=(id)=>{
    return service.get(`issues/${id}`)
}

export const addIssue=(obj)=>{
    return service.post('issues/add',obj)
}

export const editIssue = (obj)=>{
    return service.put('issues/edit',obj)
}

export const deleteIssue = (id)=>{
    return service.delete(`issues/${id}`)
}