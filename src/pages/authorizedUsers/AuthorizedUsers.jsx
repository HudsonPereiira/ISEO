import styles from "./AuthorizedUsers.module.css"

import { db, auth } from "../../firebase/config";
import { collection, doc, deleteDoc, query, where, getDocs } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { useAuthorizedUsers } from "../../hooks/useAuthorizedUsers";

const AuthorizedUsers = () => {
  const { authorizedUsers, addAuthorizedUser } = useAuthorizedUsers();
  const [newName, setNewName] = useState("");
  const [newRG, setNewRG] = useState("");
  const [newNF, setNewNF] = useState("");
  const [updatedUsers, setUpdatedUsers] = useState(authorizedUsers);

  // Função para adicionar um usuário autorizado
  const handleAddAuthorizedUser = (e) => {
    e.preventDefault();

    if (!newName || !newRG || !newNF) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    addAuthorizedUser({ name: newName, rg: newRG, nf: newNF });

    setNewName("");
    setNewRG("");
    setNewNF("");
  };

  // Função para excluir um usuário autorizado e seus dados
  const handleRemoveAuthorizedUser = async (rg, nf) => {
    try {
      // Busca o documento do usuário autorizado no Firestore
      const authorizedUserQuery = query(
        collection(db, "authorizedUsers"),
        where("rg", "==", rg),
        where("nf", "==", nf)
      );
      const querySnapshot = await getDocs(authorizedUserQuery);

      if (!querySnapshot.empty) {
        const authorizedDoc = querySnapshot.docs[0]; // Obtém o documento
        const uid = authorizedDoc.data().uid; // Obtém o UID, se existir

        // Impede autoexclusão do administrador
        if (uid && uid === auth.currentUser.uid) {
          alert("Você não pode excluir a si mesmo.");
          return;
        }

        // Exclui o documento de `authorizedUsers`
        await deleteDoc(authorizedDoc.ref);

        // Exclui o usuário em `users`, se o UID existir
        if (uid) {
          await deleteDoc(doc(db, "users", uid));

          // Exclui postagens ou outros dados associados
          const userPostsQuery = query(
            collection(db, "userPosts"), // Substitua pelo nome correto da coleção de dados associados
            where("uid", "==", uid)
          );
          const postsSnapshot = await getDocs(userPostsQuery);
          postsSnapshot.forEach(async (doc) => {
            await deleteDoc(doc.ref);
          });

          // Se o usuário excluído estiver logado, desconecte-o
          if (uid === auth.currentUser.uid) {
            await auth.signOut();
            alert("O usuário foi desconectado e excluído do sistema.");
          } else {
            alert("O usuário foi excluído com sucesso.");
          }
        }

        // Atualiza o estado local removendo o usuário excluído
        setUpdatedUsers(updatedUsers.filter((user) => user.rg !== rg));
      } else {
        alert("Usuário não encontrado.");
      }
    } catch (error) {
      console.error("Erro ao excluir o usuário:", error);
      alert("Erro ao excluir o usuário. Tente novamente.");
    }
  };

  useEffect(() => {
    setUpdatedUsers(authorizedUsers);
  }, [authorizedUsers]);

  const sortedUsers = [...updatedUsers].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <section>
      <h1>Gerenciar Autorizações</h1>

      {/* Formulário para adicionar novo militar autorizado */}
      <form onSubmit={handleAddAuthorizedUser}>
        <label>Nome:</label>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nome do militar"
          required
        />
        <label>RG:</label>
        <input
          type="text"
          value={newRG}
          onChange={(e) => setNewRG(e.target.value)}
          placeholder="RG do militar"
          required
        />
        <label>NF:</label>
        <input
          type="text"
          value={newNF}
          onChange={(e) => setNewNF(e.target.value)}
          placeholder="NF do militar"
          required
        />
      <div className={styles.btn}>
      <button className="btn" type="submit">
          Adicionar
        </button>
      </div>
      </form>

      {/* Tabela de usuários autorizados */}
      {sortedUsers.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>RG</th>
              <th>NF</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.rg}</td>
                <td>{user.nf}</td>
                <td>
                  <button
                    className="btn_delete"
                    onClick={() => handleRemoveAuthorizedUser(user.rg, user.nf)}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Nenhum militar autorizado.</p>
      )}
    </section>
  );
};

export default AuthorizedUsers;
