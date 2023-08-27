import router from "@/router";
import axios from "axios";

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
  } else
    return res.data
}, (error) => {
  // 超出 2xx 范围的状态码都会触发该函数。
  // 对响应错误做点什么
  return Promise.reject(error)
});

export default service;

