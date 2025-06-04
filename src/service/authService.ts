import { LoginRequest, LoginResponse, SignupRequest } from "@/types";
import api from "./api";

const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post("/auth/login", credentials);
    if (response.data.token) {
      localStorage.setItem("auth_token", response.data.token);
      localStorage.setItem("refresh_token", response.data.refreshToken);
    }
    return response.data;
  },

  signup: async (userData: SignupRequest): Promise<LoginResponse> => {
    const response = await api.post("/auth/signup", userData);
    if (response.data.token) {
      localStorage.setItem("auth_token", response.data.token);
      localStorage.setItem("refresh_token", response.data.refresh_token);
    }
    return response.data;
  },

  facultySignup: async (userData: SignupRequest): Promise<boolean> => {
    const response = await api.post("/auth/faculty/signup", userData);
    return response.data;
  },

  logout: async (): Promise<void> => {
    const respose = await api.post("/auth/logout");
    if (respose.status === 200) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");
    }
  },

  getCurrentUser: async (): Promise<LoginResponse | null> => {
    try {
      const response = await api.get("/auth");
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");
        return null;
      }
      return Promise.reject(error);
    }
  },
};

export default authService;
