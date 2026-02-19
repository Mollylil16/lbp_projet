import { useContext } from "react";
import { AuthContext } from "@contexts/AuthContext";

/**
 * Custom hook pour accéder au contexte d'authentification
 * @returns AuthContextType
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
