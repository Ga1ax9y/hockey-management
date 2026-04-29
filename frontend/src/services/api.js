import axios from "axios";
import { buildQuery } from "../utils/buildQuery";

const API = axios.create({
  baseURL: "http://localhost:4000/api/v1",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const getMe = () => API.get("/auth/me");
export const getUsers = (token) => API.get("/users", {
  headers: { Authorization: `Bearer ${token}` },
});
export const getUserById = (id, token) =>
  API.get(`/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const createUser = (data) => API.post("/users", data);

export const getRoles = () => API.get("/roles");
export const getRoleById = (id) => API.get(`/roles/${id}`);
export const createRole = (data) => API.post("/roles", data);
export const updateRole = (id, data) => API.put(`/roles/${id}`, data);
export const deleteRole = (id) => API.delete(`/roles/${id}`);

export const getTeams = () => API.get("/teams");
export const getTeamById = (id, params = {}) => {
  return API.get(`/teams/${id}${buildQuery(params)}`)
}
export const createTeam = (data) => API.post("/teams", data);
export const updateTeam = (id, data) => API.put(`/teams/${id}`, data);
export const deleteTeam = (id) => API.delete(`/teams/${id}`,);

export const getTeamUsers = (teamId) => API.get(`/teams/${teamId}/users`);
export const addTeamUser = (teamId, userId) =>
  API.post(`/teams/${teamId}/users`, { userId });
export const removeTeamUser = (teamId, userId) =>
  API.delete(`/teams/${teamId}/users/${userId}`);
export const getAllUsers = () => API.get("/users");

export const getPlayers = (params = {}) => {
  return API.get(`/players/${buildQuery(params)}`)
};
export const getPlayerById = (id, params = {}) => {
  return API.get(`/players/${id}${buildQuery(params)}`)
}
export const createPlayer = (data) => API.post("/players", data);
export const updatePlayer = (id, data) => API.put(`/players/${id}`, data);
export const deletePlayer = (id) => API.delete(`/players/${id}`);
export const changePlayerTeam = (id, newTeamId) => API.patch(`/transfers/add/${id}`, {newTeamId});

export const getTrainings = () => API.get("/trainings");
export const getTrainingById = (id, params = {}) => {
  return API.get(`/trainings/${id}${buildQuery(params)}`)
}
export const createTraining = (data) => API.post("/trainings", data);
export const updateTraining = (id, data) => API.put(`/trainings/${id}`, data);
export const deleteTraining = (id) => API.delete(`/trainings/${id}`);

export const getMedicalRecords = (id, params = {}) => {
  return API.get(`/medicals/${id}/${buildQuery(params)}`)
}
export const addMedicalRecord = (id, data) =>
  API.post(`/medicals/add/${id}`, data);
export const markPlayerRecovered = (id, data) =>
  API.patch(`/medicals/${id}/recover`, data)

export const createMatch = (data) => API.post("/matches", data);
export const getMatchById = (id, params = {}) => {
  return API.get(`/matches/${id}${buildQuery(params)}`)
}
export const updateMatch = (id, data) => API.put(`/matches/${id}`, data);
export const completeMatch = (id, data) => API.patch(`/matches/${id}/complete`, data);
export const deleteMatch = (id) => API.delete(`/matches/${id}`);

export const getSchedule = (teamId, params) =>
    API.get(`/schedule/${teamId}${buildQuery(params)}`);

export const getPhysicalRecords = (id, params = {}) => {
  return API.get(`/physicals/${id}/${buildQuery(params)}`)
}
export const addPhysicalRecord = (id, data) =>
  API.post(`/physicals/add/${id}`, data);

export const syncMatchStats = (data) => API.put("/match-stats/sync", data);
export const syncTrainingStats = (data) => API.put("/training-stats/sync", data);
