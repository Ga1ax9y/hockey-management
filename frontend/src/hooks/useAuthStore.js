import { create } from "zustand";
import { parseJwt } from "../utils/auth";

const storedToken = localStorage.getItem("token");
const initialUser = storedToken ? parseJwt(storedToken) : null;

export const useAuthStore = create((set) => ({
  user: initialUser?.email || null,
  role: initialUser?.role_id || null,
  token: storedToken || null,

  get isAuthenticated() {
    return !!this.token;
  },

  login: (jwtToken) => {
    const payload = parseJwt(jwtToken);
    if (!payload) return;
    localStorage.setItem("token", jwtToken);
    set({
      user: payload.email,
      role: payload.role_id,
      token: jwtToken,
    });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, role: null, token: null });
  },

}));
