
import axios from "axios";

axios.defaults.baseURL = "http://192.168.1.176";
axios.defaults.timeout=60*1000;
axios.defaults.withCredentials = true
// axios.defaults.headers = {
//     'Content-Type': 'application/json', // 设置请求头
// }

// 添加响应拦截器
axios.interceptors.response.use(function (response) {
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么
    if(response.data.msg==="NOTLOGIN"){
        // console.log(response)
        localStorage.removeItem('user')
        window.location.href='/login'
    }else
        return response
  }, function (error) {
    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么
    
  });

export default axios;

