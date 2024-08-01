import * as request from '../api/requester';

const baseUrl = 'http://localhost:3030/users';

export const login = (email, password) => request.post(`${baseUrl}/login`, { email, password });

export const register = (email, password, username) => request.post(`${baseUrl}/register`, { email, password, username , status: "user_logged" });

export const logout = () => request.get(`${baseUrl}/logout`);
