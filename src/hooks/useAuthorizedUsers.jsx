import { useState, useEffect } from "react";
import { db, auth } from "../firebase/config";
import { collection, getDocs, addDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { signOut, getAuth } from "firebase/auth"; // Importando o auth para fazer o logout

export const useAuthorizedUsers = () => {
  const [authorizedUsers, setAuthorizedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carregar os usuários autorizados do Firebase
  useEffect(() => {
    const fetchAuthorizedUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "authorizedUsers"));
        const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAuthorizedUsers(users);
      } catch (error) {
        console.error("Erro ao carregar usuários autorizados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthorizedUsers();
  }, []);

  // Função para adicionar um militar autorizado no Firebase
  const addAuthorizedUser = async ({ name, rg, nf }) => {
    try {
      const userExists = isAuthorized(rg, nf);
      if (userExists) {
        return { success: false, message: "Este usuário já está autorizado." };
      }

      const docRef = await addDoc(collection(db, "authorizedUsers"), { name, rg, nf });
      setAuthorizedUsers(prevUsers => [
        ...prevUsers,
        { id: docRef.id, name, rg, nf }
      ]);
      return { success: true, message: "Usuário autorizado adicionado com sucesso." };
    } catch (error) {
      console.error("Erro ao adicionar usuário autorizado:", error);
      return { success: false, message: "Erro ao adicionar o usuário autorizado." };
    }
  };

  // Função para remover um militar autorizado do Firebase
  const removeAuthorizedUser = async (rg, nf) => {
    try {
      // Busca o usuário autorizado com o mesmo RG e NF
      const userQuery = query(collection(db, "authorizedUsers"), where("rg", "==", rg), where("nf", "==", nf));
      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {
        console.log("Usuário autorizado não encontrado.");
        return; // Caso o usuário não seja encontrado
      }

      // Obtém o ID do documento do usuário autorizado
      const userDoc = userSnapshot.docs[0];
      const userId = userDoc.id;

      // Remove o usuário da coleção "authorizedUsers"
      await deleteDoc(doc(db, "authorizedUsers", userId));

      // Atualiza a lista local de usuários autorizados
      setAuthorizedUsers(prevUsers => prevUsers.filter(user => user.id !== userId));

      console.log("Usuário autorizado removido com sucesso.");
    } catch (error) {
      console.error("Erro ao remover usuário autorizado:", error);
    }
  };

  // Função para verificar se um RG e NF são autorizados
  const isAuthorized = (rg, nf) => {
    return authorizedUsers.some((user) => user.rg === rg && user.nf === nf);
  };

  return { authorizedUsers, addAuthorizedUser, removeAuthorizedUser, isAuthorized, loading };
};
