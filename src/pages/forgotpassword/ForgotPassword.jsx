import { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import styles from "./forgotPassword.module.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const auth = getAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
    } catch (error) {
      setError("Ocorreu um erro. Verifique se o e-mail está correto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.forgotPassword}>
      <h1>Recuperar Senha</h1>
      <p>Digite seu e-mail para receber um link de recuperação.</p>
      <form onSubmit={handleSubmit}>
        <label>
          <span>E-mail:</span>
          <input
            type="email"
            required
            placeholder="E-mail associado à sua conta"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        {!loading && <button className="btn">Enviar Link</button>}
        {loading && (
          <button className="btn" disabled>
            Enviando...
          </button>
        )}

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
      </form>
    </div>
  );
};

export default ForgotPassword;
