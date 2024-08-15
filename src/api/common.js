import service from "@/plugins/service";

export const deleteImg=(name)=>{
    return service.delete(`/common/delete`,{params:{name}})
}

export const uploadImg=(file)=>{
    const formData = new FormData();
    formData.append('file', file);
    return service.post(`/common/upload`,formData,{
        headers: {
            'Content-Type': `multipart/form-data;charset=utf-8`, 
        }
    });
}