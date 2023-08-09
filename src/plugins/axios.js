
import axios from "axios";

axios.defaults.baseURL = "/api";
axios.defaults.timeout=60*1000;

export default axios;

