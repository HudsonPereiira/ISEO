import styles from "./Login.module.css";
import { useState, useEffect } from "react";
import { useAutentication } from "../../hooks/useAutentication";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";  // Importar Link

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login, error: authError, loading, role, user } = useAutentication();
  const navigate = useNavigate();

  // Efetua a navegação apenas quando o estado de usuário e role estiverem prontos
  useEffect(() => {
    if (user && role) {
      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/setform");
      }
    }
  }, [user, role, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");  // Limpa o erro anterior
    const userData = { email, password };

    // Espera o login completar antes de definir o erro ou navegar
    const loggedInUser = await login(userData);

    if (loggedInUser) {
      // Aguarda role ser carregado após login
      if (role) {
        // Navega para a página correspondente com base no role
        if (role === "admin") {
          navigate("/admin");
        } else {
          navigate("/setform");
        }
      }
    } else {
      // Apenas mostra o erro se o login falhar
      setError("Falha no login. Verifique suas credenciais.");
    }
  };

  // Atualiza o erro se ele for vindo do hook
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  return (
    <div className={styles.login}>
      <h1>Entrar</h1>
      <p>Faça login para utilizar o sistema.</p>
      <form onSubmit={handleSubmit}>
        <label>
          <span>E-mail:</span>
          <input
            type="email"
            name="email"
            required
            placeholder="E-mail do usuário"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label>
          <span>Senha:</span>
          <input
            type="password"
            name="password"
            required
            placeholder="Insira sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="off"
          />
        </label>

        {!loading && <button className="btn">Entrar</button>}
        {loading && (
          <button className="btn" disabled>
            Aguarde...
          </button>
        )}
        {error && <p className="error">{error}</p>}
      </form>

      <div className={styles.forgotPasswordLink}>
        <Link to="/forgotpassword">Esqueci minha senha</Link> {/* Link para recuperação de senha */}
      </div>
    </div>
  );
};

export default Login;
