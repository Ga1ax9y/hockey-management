import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:4000",
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
export const getUsers = (token) => API.get("/api/users", {
  headers: { Authorization: `Bearer ${token}` },
});
export const getUserById = (id, token) =>
  API.get(`/api/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const getCurrentUser = () => API.get("/api/users/me");

export const getRoles = () => API.get("/api/roles");
export const getRoleById = (id) => API.get(`/api/roles/${id}`);
export const createRole = (data) => API.post("/api/roles", data);
export const updateRole = (id, data) => API.put(`/api/roles/${id}`, data);
export const deleteRole = (id) => API.delete(`/api/roles/${id}`);

export const getTeams = () => API.get("/api/teams");
export const getTeamById = (id) => API.get(`/api/teams/${id}`);
export const createTeam = (data) => API.post("/api/teams", data);
export const updateTeam = (id, data) => API.put(`/api/teams/${id}`, data);
export const deleteTeam = (id) => API.delete(`/api/teams/${id}`,);

export const getCurrentUserTeams = () => API.get("/api/users/me/teams");
export const getTeamUsers = (teamId) => API.get(`/api/teams/${teamId}/users`);
export const addTeamUser = (teamId, userId) =>
  API.post(`/api/teams/${teamId}/users`, { userId });
export const removeTeamUser = (teamId, userId) =>
  API.delete(`/api/teams/${teamId}/users/${userId}`);
export const getAllUsers = () => API.get("/api/users");

export const getPlayers = (teamId = null) => {
  if (teamId) {
    return API.get(`/api/players?teamId=${teamId}`);
  }
  return API.get("/api/players");
};
export const getPlayerById = (id) => API.get(`/api/players/${id}`);
export const createPlayer = (data) => API.post("/api/players", data);
export const updatePlayer = (id, data) => API.put(`/api/players/${id}`, data);
export const deletePlayer = (id) => API.delete(`/api/players/${id}`);
export const getPlayerMatchStats = (playerId) => API.get(`/api/players/${playerId}/match-stats`);
export const getPlayerTrainingStats = (playerId) => API.get(`/api/players/${playerId}/training-stats`);
export const getPlayerCareerHistory = (playerId) => API.get(`/api/players/${playerId}/career`);
export const getPlayerMedicalHistory = (playerId) => API.get(`/api/players/${playerId}/medical`);

export const getTrainings = () => API.get("/api/trainings");
export const getTrainingById = (id) => API.get(`/api/trainings/${id}`);
export const createTraining = (data) => API.post("/api/trainings", data);
export const updateTraining = (id, data) => API.put(`/api/trainings/${id}`, data);
export const deleteTraining = (id) => API.delete(`/api/trainings/${id}`);

export const addMedicalRecord = (playerId, data) =>
  API.post(`/api/players/${playerId}/medical`, data);
