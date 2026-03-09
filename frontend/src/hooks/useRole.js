import { useAuthStore } from "./useAuthStore";

export const useRole = () => {
    const user = useAuthStore(state => state.user)

    return {
        isAdmin: user?.role?.code === "ADMIN",
        isCoach: user?.role?.code === "COACH",
        isManager: user?.role?.code === "MANAGER",
        isDoctor: user?.role?.code === "DOCTOR",
        role: user?.role?.code
    }
}
