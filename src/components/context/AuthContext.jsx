import React, { useState, useContext, createContext, useEffect } from "react";

// Criação do contexto de autenticação
const AuthContext = createContext();

// Componente Provider para envolver a aplicação e passar o estado de autenticação
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Estado para armazenar o usuário
  const [isAdmin, setIsAdmin] = useState(false); // Estado para saber se é admin

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user")); // Tenta pegar o usuário do localStorage
    if (storedUser) {
      setUser(storedUser);
      setIsAdmin(storedUser.isAdmin); // Verifica se o usuário é admin
    }
  }, []);

  // Função de login que configura o estado
  const login = (userData) => {
    setUser(userData);
    setIsAdmin(userData.isAdmin);
    localStorage.setItem("user", JSON.stringify(userData)); // Salva no localStorage
  };

  // Função de logout que limpa o estado
  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem("user"); // Remove do localStorage
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para acessar o contexto
export function useAuth() {
  return useContext(AuthContext);
}
