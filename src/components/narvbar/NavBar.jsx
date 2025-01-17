import { useAutentication } from "../../hooks/useAutentication";
import { NavLink } from "react-router-dom";
import styles from "./NavBar.module.css";

const NavBar = () => {
  const { user, role, logout } = useAutentication(); 

  // Lógica para logout
  const handleLogout = () => {
    logout(); 
  };

  return (
    <nav className={styles.navbar}>
      <NavLink className={styles.brand}>
      <span>
          ISEO
          {user && user.displayName && (
            <span> - {user.displayName}
            </span>
          )}
        </span>
      </NavLink>

      <ul className={styles.links_list}>
        
        {!user && (
          <>
            <li>
              <NavLink
                className={({ isActive }) => (isActive ? styles.active : "")}
                to="/"
              >
                Entrar
              </NavLink>
            </li>

            <li>
              <NavLink
                className={({ isActive }) => (isActive ? styles.active : "")}
                to="/register"
              >
                Cadastrar
              </NavLink>
            </li>
          </>
        )}

      
        {user && role !== "admin" && (
          <li>
            <NavLink
              className={({ isActive }) => (isActive ? styles.active : "")}
              to="/setform"
            >
              Preencha
            </NavLink>
          </li>
        )}

        
        {user && role === "admin" && (
          <li>
            <NavLink
              className={({ isActive }) => (isActive ? styles.active : "")}
              to="/admin"
            >
              Admin
            </NavLink>
          </li>
        )}

        {user && role === "admin" && (
          <li>
            <NavLink
              className={({ isActive }) => (isActive ? styles.active : "")}
              to="/authorizedusers"
            >
              Autorizações
            </NavLink>
          </li>
        )}

        {user && (
          <li>
            <button onClick={handleLogout} className={styles.logoutButton}>
              Sair
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default NavBar;
