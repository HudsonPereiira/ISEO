import { useEffect } from "react";
import { signOut, deleteUser, setPersistence, browserLocalPersistence } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { getDoc, doc } from "firebase/firestore";

const useUserDisconnection = (userId) => {
  // Desconectar ao fechar o navegador
  useEffect(() => {
    const handleBeforeUnload = async (event) => {
      event.preventDefault(); // Evita o fechamento imediato
      try {
        // Configura a persistência para não manter a sessão no navegador
        await setPersistence(auth, browserLocalPersistence);

        // Tenta fazer o logout do usuário
        await signOut(auth);
        console.log("Usuário desconectado ao fechar o navegador");
      } catch (error) {
        console.error("Erro ao fazer logout ao fechar o navegador:", error);
      }
    };

    // Adiciona o listener ao evento de fechamento do navegador
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup do listener
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Desconectar ao ser excluído do banco de dados
  useEffect(() => {
    const checkIfUserDeleted = async () => {
      try {
        // Verifica se o usuário foi excluído do Firestore
        const userDocRef = doc(db, "users", userId);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          // Se o documento não existir, significa que o usuário foi excluído
          console.log("Usuário excluído do Firestore. Desconectando...");

          // Exclui o usuário da autenticação do Firebase
          const currentUser = auth.currentUser;

          if (currentUser && currentUser.uid === userId) {
            await deleteUser(currentUser); // Exclui o usuário da autenticação do Firebase
            console.log("Usuário excluído do Firebase Authentication");

            // Força o logout
            await signOut(auth);
            console.log("Usuário desconectado após exclusão do Firestore");
          }
        }
      } catch (error) {
        console.error("Erro ao verificar se o usuário foi excluído:", error);
      }
    };

    if (userId) {
      checkIfUserDeleted();
    }
  }, [userId]);

  // Verificar ao carregar o aplicativo se o usuário está autenticado
  useEffect(() => {
    const checkAndSignOut = async () => {
      const user = auth.currentUser;
      if (user) {
        console.log("Usuário já está logado");
      } else {
        console.log("Usuário não está logado");
      }
    };

    checkAndSignOut();
  }, []);
};

export default useUserDisconnection;
