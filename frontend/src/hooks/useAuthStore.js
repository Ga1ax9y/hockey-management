import { create } from "zustand";
import { getMe } from "../services/api";
export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem("token") || null,
  isLoading: true,

  init: async () => {
    const token  = get().token;
    if (!token){
      set({ isLoading: false });
      return;
    }
    await get().fetchUser()
  },

  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const response = await getMe()
      set({ user: response.data, isLoading: false });
    } catch (error) {
      console.error("Ошибка при получении профиля", error);
      get().logout();
    } finally {
      set({ isLoading: false });
    }
  },
  login: async (jwtToken) => {
    localStorage.setItem("token", jwtToken);
    set({ token: jwtToken });
    await get().fetchUser();
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null, isLoading: false });
  },

}));
