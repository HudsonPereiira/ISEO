import { db } from "../firebase/config";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  deleteUser,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  collection,
  where,
  deleteDoc,
} from "firebase/firestore";
import { useState, useEffect } from "react";

export const useAutentication = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [cancelled, setCancelled] = useState(false);

  const auth = getAuth();

  // Verifica se o componente foi desmontado
  function checkIfIsCancelled() {
    if (cancelled) {
      return;
    }
  }

  // Monitora o estado de autenticação do usuário
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        getUserRole(currentUser.uid);
      } else {
        setRole(null);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  // Função para buscar o role do usuário no Firestore
  const getUserRole = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const userRole = userDoc.data().role;
        setRole(userRole);
      } else {
        console.warn("Usuário não encontrado no banco de dados.");
        setRole(null);
      }
    } catch (error) {
      console.error("Erro ao buscar role:", error);
      setRole(null);
      setError("Erro ao carregar o role do usuário.");
    }
  };

  // Função para criar um novo usuário
  const createUser = async (data) => {
    checkIfIsCancelled();
    setLoading(true);
    setError(null);

    try {
      // Verifica se o RG e NF existem em authorizedUsers
      const authorizedQuery = query(
        collection(db, "authorizedUsers"),
        where("rg", "==", data.rg),
        where("nf", "==", data.nf)
      );
      const authorizedSnapshot = await getDocs(authorizedQuery);

      if (authorizedSnapshot.empty) {
        throw new Error("RG e NF não autorizados. Verifique com o administrador.");
      }

      // Verifica se RG e NF já estão cadastrados em users
      const rgQuery = query(collection(db, "users"), where("rg", "==", data.rg));
      const nfQuery = query(collection(db, "users"), where("nf", "==", data.nf));

      const [rgSnapshot, nfSnapshot] = await Promise.all([
        getDocs(rgQuery),
        getDocs(nfQuery),
      ]);

      if (!rgSnapshot.empty) {
        throw new Error("RG já cadastrado.");
      }

      if (!nfSnapshot.empty) {
        throw new Error("NF já cadastrada.");
      }

      // Cria o usuário no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user = userCredential.user;

      // Atualiza o perfil do usuário
      await updateProfile(user, { displayName: data.displayName });

      // Cria o documento do usuário na coleção users
      await setDoc(doc(db, "users", user.uid), {
        displayName: data.displayName,
        email: data.email,
        rg: data.rg,
        nf: data.nf,
        rank: data.rank,
        role: "user",
        createdAt: new Date(),
        uid: user.uid, // Vincula a UID ao documento
      });

      // Atualiza o UID na coleção authorizedUsers
      const authorizedDoc = authorizedSnapshot.docs[0]; // Assume que o RG e NF são únicos
      await setDoc(
        authorizedDoc.ref,
        { ...authorizedDoc.data(), uid: user.uid },
        { merge: true }
      );

      setLoading(false);
      getUserRole(user.uid); // Atualiza a role do usuário
      return user;
    } catch (error) {
      console.error("Erro ao criar usuário:", error.message);
      let systemErrorMessage;

      if (error.message.includes("password")) {
        systemErrorMessage = "A senha precisa conter ao menos 6 caracteres.";
      } else if (error.message.includes("email-already")) {
        systemErrorMessage = "E-mail já cadastrado.";
      } else if (error.message === "RG já cadastrado.") {
        systemErrorMessage = "O RG informado já está cadastrado.";
      } else if (error.message === "NF já cadastrada.") {
        systemErrorMessage = "A NF informada já está cadastrada.";
      } else if (error.message.includes("não autorizados")) {
        systemErrorMessage = error.message; // Erro já informativo
      } else {
        systemErrorMessage = "Ocorreu um erro. Por favor, tente mais tarde.";
      }

      setLoading(false);
      setError(systemErrorMessage);
    }
  };

  // Função para deslogar
  const logout = async () => {
    checkIfIsCancelled();

    try {
      await signOut(auth);
      console.log("Usuário deslogado com sucesso");
    } catch (error) {
      console.error("Erro ao fazer logout: ", error.message);
    }
  };

  // Função de login
  const login = async (data) => {
    checkIfIsCancelled();
    setLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user = userCredential.user;
      setLoading(false);

      getUserRole(user.uid);

      return user;
    } catch (error) {
      console.error("Erro no login:", error.message);
      let systemErrorMessage;

      if (error.message.includes("user-not-found")) {
        systemErrorMessage = "Usuário não encontrado.";
      } else if (error.message.includes("auth/invalid-credential")) {
        systemErrorMessage = "Verifique o login e a senha.";
      } else {
        systemErrorMessage = "Ocorreu um erro. Por favor, tente mais tarde.";
      }

      setError(systemErrorMessage);
      setLoading(false);
      return null;
    }
  };

  // Função para excluir um usuário
  const deleteUserByRG = async (rg) => {
    setLoading(true);
    setError(null);

    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        setError("Usuário não autenticado.");
        setLoading(false);
        return;
      }

      const userQuery = query(
        collection(db, "users"),
        where("rg", "==", rg)
      );
      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {
        setError("Usuário não encontrado.");
        setLoading(false);
        return;
      }

      const userToDeleteDoc = userSnapshot.docs[0];
      const userToDeleteUID = userToDeleteDoc.id;

      // Verifica se o administrador está tentando excluir a si mesmo
      if (currentUser.uid === userToDeleteUID) {
        setError("Você não pode excluir a si mesmo.");
        setLoading(false);
        return;
      }

      // Exclui o usuário do Firebase Authentication
      await deleteUser(auth.currentUser);

      // Exclui o usuário da coleção 'users'
      await deleteDoc(doc(db, "users", userToDeleteUID));

      // Exclui o usuário da coleção 'authorizedUsers'
      const authorizedQuery = query(
        collection(db, "authorizedUsers"),
        where("rg", "==", rg)
      );
      const authorizedSnapshot = await getDocs(authorizedQuery);
      authorizedSnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      setLoading(false);
      console.log("Usuário excluído com sucesso.");
    } catch (error) {
      console.error("Erro ao excluir o usuário:", error);
      setError("Ocorreu um erro ao excluir o usuário.");
      setLoading(false);
    }
  };

  // Limpeza do estado ao desmontar o componente
  useEffect(() => {
    return () => setCancelled(true);
  }, []);

  return {
    auth,
    createUser,
    error,
    loading,
    user,
    role,
    logout,
    login,
    deleteUserByRG,
  };
};
