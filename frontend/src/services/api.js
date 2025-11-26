import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:4000",
});

export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const getUsers = (token) => API.get("/api/users", {
  headers: { Authorization: `Bearer ${token}` },
});
export const getUserById = (id, token) =>
  API.get(`/api/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
