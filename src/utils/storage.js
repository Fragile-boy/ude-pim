const User_Key = "ude_pim_user"

export const getInfo = ()=>{
    return JSON.parse(localStorage.getItem(User_Key))
}

export const setInfo = (obj)=>{
    localStorage.setItem(User_Key,JSON.stringify(obj))
}

export const removeInfo = ()=>{
    
}