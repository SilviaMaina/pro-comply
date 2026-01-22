import axios  from "axios";

const client = axios.create({
    baseURL: "http://127.0.0.1:8000/accounts",
    headers:{ 'Content-Type': 'application/json' }
});
client.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');  
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;});


export default client;
