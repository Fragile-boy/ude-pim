import router from "@/router";
import axios from "axios";
import { Message } from "element-ui";

const service = axios.create({
  baseURL: "http://localhost",
  timeout: 1000 * 60,
  withCredentials: true,
});


// 添加响应拦截器
service.interceptors.response.use((res) => {
  // 2xx 范围内的状态码都会触发该函数。
  // 对响应数据做点什么
  if (res.data.msg === "NOTLOGIN") {
    localStorage.removeItem('user')
    router.push('/login')
    return Promise.reject(res.data.msg)
  } else if(res.data.code===404){
    Message({
      message:'系统错误，请稍后重试',
      type:'error'
    })
  }else
    return res.data
}, (error) => {
  // 超出 2xx 范围的状态码都会触发该函数。
  // 对响应错误做点什么
  Message({
    message:'系统繁忙，请稍后重试',
    type:'error'
  })
  return Promise.reject(error)
});

export default service;

