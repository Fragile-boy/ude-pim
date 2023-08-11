
import axios from "axios";

axios.defaults.baseURL = "http://192.168.1.176/";
axios.defaults.timeout=60*1000;

export default axios;

