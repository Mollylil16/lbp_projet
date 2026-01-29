import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { User, LoginCredentials, AuthResponse } from "@types";
import { authService } from "@services/auth.service";
import toast from "react-hot-toast";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Vérifier si l'utilisateur est déjà connecté au chargement
  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem("lbp_token");
      if (token) {
        // En mode mock, récupérer depuis localStorage
        if (import.meta.env.DEV && token.startsWith("mock_token_")) {
          const userStr = localStorage.getItem("lbp_mock_user");
          if (userStr) {
            setUser(JSON.parse(userStr));
            setIsLoading(false);
            return;
          }
        }

        // Vérifier la validité du token et récupérer l'utilisateur
        const userData = await authService.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      // Token invalide ou expiré
      localStorage.removeItem("lbp_token");
      localStorage.removeItem("lbp_refresh_token");
      localStorage.removeItem("lbp_mock_user");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await authService.login(credentials);

      // Sauvegarder le token
      localStorage.setItem("lbp_token", response.token);
      if (response.refresh_token) {
        localStorage.setItem("lbp_refresh_token", response.refresh_token);
      }

      // Sauvegarder les permissions
      localStorage.setItem(
        "lbp_permissions",
        JSON.stringify(response.permissions)
      );

      // En mode mock, sauvegarder aussi l'utilisateur
      if (import.meta.env.DEV) {
        localStorage.setItem("lbp_mock_user", JSON.stringify(response.user));
      }

      setUser(response.user);
      toast.success(`Bienvenue ${response.user.full_name} !`);
      navigate("/dashboard");
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || "Erreur de connexion";
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("lbp_token");
    localStorage.removeItem("lbp_refresh_token");
    localStorage.removeItem("lbp_permissions");
    localStorage.removeItem("lbp_mock_user");
    setUser(null);
    navigate("/login");
    toast.success("Déconnexion réussie");
  };

  const refreshUser = useCallback(async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error("Error refreshing user:", error);
      logout();
    }
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
