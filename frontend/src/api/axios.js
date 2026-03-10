import axios from 'axios';

export default axios.create({baseURL: 'http://localhost:4000'})

export const privateAxios = axios.create({baseURL: 'http://localhost:4000',
    headers: {"Content-Type": "application-json"},
    
})