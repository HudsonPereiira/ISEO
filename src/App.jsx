import styles from "./App.module.css";

import { onAuthStateChanged } from "firebase/auth";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import NavBar from "./components/narvbar/NavBar";
import Footer from "./components/footer/Footer";
import { AuthProvider } from "./components/context/AuthContext";
import { useState, useEffect } from "react";
import { useAutentication } from "./hooks/useAutentication";

// Pages
import Register from "./pages/register/Register";
import Login from "./pages/login/Login";
import SetForm from "./pages/setform/SetForm";
import Admin from "./pages/admin/Admin";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import AuthorizedUsers from "./pages/authorizedUsers/AuthorizedUsers";

function App() {
  const [user, setUser] = useState(undefined); // Estado para o usuário
  const { auth, role } = useAutentication(); // Agora temos acesso ao 'role' diretamente

  const loadingUser = user === undefined;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Atualiza o estado com o usuário logado
    });

    return () => unsubscribe(); // Limpa o listener quando o componente for desmontado
  }, [auth]);

  if (loadingUser) {
    return (
      <div className="loading-container">
        <p>Carregando...</p>
      </div>
    ); // Exibe enquanto está verificando o status do usuário
  }

  return (
    <div>
      <AuthProvider value={{ user, role }}>
        <BrowserRouter>
          <header>
            <NavBar />
          </header>
          <main  className={styles.app}>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
              {/* Rota SetForm, visível apenas para usuários não admins */}
              <Route
                path="/setform"
                element={
                  user && role !== "admin" ? <SetForm /> : <Navigate to="/" />
                }
              />
              {/* Rota Admin, visível apenas para admins */}
              <Route
                path="/admin"
                element={role === "admin" ? <Admin /> : <Navigate to="/" />}
              />
              <Route
                path="/authorizedusers"
                element={
                  role === "admin" ? (
                    <AuthorizedUsers />
                  ) : (
                    <Navigate to="/" />
                  )
                }
              />
              <Route path="/forgotpassword" element={<ForgotPassword />} />
            </Routes>
          </main>
          <footer className="footer">
            <Footer />
          </footer>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
