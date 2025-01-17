import styles from "../login/Login.module.css";
import { useState, useEffect } from "react";
import { useAutentication } from "../../hooks/useAutentication";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rg, setRg] = useState("");
  const [nf, setNf] = useState("");
  const [rank, setRank] = useState("Soldado"); // Graduação padrão
  const [error, setError] = useState("");

  const { createUser, error: authError, loading } = useAutentication();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("As senhas precisam ser iguais.");
      return;
    }

    const user = {
      displayName,
      email,
      password,
      rg,
      nf,
      rank, // Inclui o campo graduação
      role: "user", // Papel padrão do usuário
    };

    const res = await createUser(user);

    if (res) {
      navigate("/setform"); // Redireciona para a página SetForm após registro
    } else {
      setError("Falha no registro. Tente novamente.");
    }
  };

  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  return (
    <div className={styles.register}>
      <h1>Cadastre-se para acessar</h1>
      <form onSubmit={handleSubmit}>
        <label>
          <h3>Graduação:</h3>
          <select
            className="select"
            name="rank"
            value={rank}
            onChange={(e) => setRank(e.target.value)}
            required
          >
            <option value="Soldado">Soldado</option>
            <option value="Cabo">Cabo</option>
            <option value="3º Sargento">3º Sargento</option>
            <option value="2º Sargento">2º Sargento</option>
            <option value="1º Sargento">1º Sargento</option>
            <option value="Subtenente">Subtenente</option>
          </select>
        </label>

        <label>
          <span>Nome:</span>
          <input
            type="text"
            name="displayName"
            required
            placeholder="Nome do usuário"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </label>

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
          <span>RG:</span>
          <input
            type="number"
            name="RG"
            required
            placeholder="Informe o RG"
            value={rg}
            onChange={(e) => setRg(e.target.value)}
          />
        </label>

        <label>
          <span>NF:</span>
          <input
            type="text"
            name="NF"
            required
            placeholder="Informe o número funcional"
            value={nf}
            onChange={(e) => setNf(e.target.value)}
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

        <label>
          <span>Confirmação de senha:</span>
          <input
            type="password"
            name="confirmPassword"
            required
            placeholder="Confirme sua senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="off"
          />
        </label>

        {!loading && <button className="btn">Cadastrar</button>}
        {loading && (
          <button className="btn" disabled>
            Aguarde...
          </button>
        )}
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default Register;
