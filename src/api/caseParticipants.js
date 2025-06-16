import service from "@/plugins/service";

export const getMemberList=(caseId)=>{
    return service.get(`/caseParticipants/list/${caseId}`)
}

export const addMember=(obj)=>{
    return service.post('/caseParticipants/add',obj)
}

export const deleteMember=(id)=>{
    return service.delete(`/caseParticipants/delete/${id}`)
}

export const updateMember=(obj)=>{
    return service.put('/caseParticipants/update',obj)
}