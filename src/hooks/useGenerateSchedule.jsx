import { useState } from "react";
import { db } from "../firebase/config";
import { getDoc, doc } from "firebase/firestore";

export const useGenerateSchedule = (availableDates, userRequests) => {
  const [generatedSchedule, setGeneratedSchedule] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Função para converter datas no formato dd/mm/yyyy para ISO
  const formatDateToISO = (dateString) => {
    const [day, month, year] = dateString.split("/");
    return `${year}-${month}-${day}`; // Formato ISO
  };

  const handleGenerateSchedule = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      console.log("Iniciando geração da escala...");
      const schedule = [];
      const ranksOrder = [
        "soldado", // Mais moderno
        "cabo",
        "3º sargento",
        "2º sargento",
        "1º sargento",
        "subtenente", // Mais antigo
      ];

      // Obter informações adicionais dos usuários
      const allUserInfo = await Promise.all(
        userRequests.map(async (request) => {
          try {
            const userDoc = await getDoc(doc(db, "users", request.userId));
            if (!userDoc.exists()) {
              console.warn(`Usuário com ID ${request.userId} não encontrado.`);
              return null;
            }
            const userData = userDoc.data();
            return {
              ...request,
              rank: userData.rank || "N/A",
              displayName: userData.displayName || "N/A",
              rg: userData.rg || "N/A",
              nf: userData.nf || "N/A",
              availableDates: request.selectedDate
                ? [formatDateToISO(request.selectedDate)]
                : [],
              maxShifts: parseInt(request.quantasEscalas) || 1,
              motorista: request.motorista === "Sim",
              assignedCount: 0,
            };
          } catch (error) {
            console.error("Erro ao buscar dados do usuário:", error);
            return null;
          }
        })
      );

      const validUserInfo = allUserInfo.filter(Boolean);
      console.log("Usuários válidos:", validUserInfo);

      if (validUserInfo.length === 0) {
        throw new Error("Nenhum usuário válido encontrado.");
      }

      // Ordenar usuários por antiguidade
      let sortedUsers = validUserInfo.sort((a, b) => {
        // Índice da graduação no ranksOrder
        const rankA = ranksOrder.indexOf((a.rank || "").toLowerCase());
        const rankB = ranksOrder.indexOf((b.rank || "").toLowerCase());

        // Validar índices
        if (rankA === -1 || rankB === -1) {
          // Se um rank não for encontrado, colocá-lo no final
          return rankA === -1 ? 1 : -1;
        }

        // Comparar pela graduação no ranksOrder (mais modernos têm índice menor)
        if (rankA !== rankB) {
          return rankA - rankB; // Graduações modernas antes das antigas
        }

        // Dentro da mesma graduação, comparar pelo RG (maior RG é mais moderno)
        const rgA = parseInt(a.rg, 10);
        const rgB = parseInt(b.rg, 10);

        if (isNaN(rgA) || isNaN(rgB)) {
          // Se um RG não for numérico, colocá-lo no final
          return isNaN(rgA) ? 1 : -1;
        }

        return rgB - rgA; // Maior RG é mais moderno
      });

      console.log("Usuários ordenados por antiguidade (após sort):");
      sortedUsers.forEach((user) => {
        console.log(
          `RG: ${user.rg}, Rank: ${user.rank}, DisplayName: ${user.displayName}`
        );
      });

      // Filas de controle
      let notYetAssignedQueue = [...sortedUsers]; // Garantir que todos passem pela fila ao menos uma vez
      let allUsersQueue = [...sortedUsers]; // Fila completa para rodadas adicionais
      let alreadyAssignedThisRound = new Set(); // Controle dos usuários já escalados nesta rodada

      // Loop para preencher as escalas
      for (const availableDate of availableDates) {
        const assignedUsers = [];
        let slotsRemaining = availableDate.slots;

        while (slotsRemaining > 0) {
          let user;

          // Priorizar usuários que ainda não foram escalados na rodada atual
          if (notYetAssignedQueue.length > 0) {
            user = notYetAssignedQueue.shift(); // Escalar da fila de não escalados
          } else {
            // Reiniciar a fila após completar uma rodada
            notYetAssignedQueue = [...allUsersQueue];
            alreadyAssignedThisRound.clear(); // Resetar o controle da rodada
            user = notYetAssignedQueue.shift();
          }

          if (!user) break;

          // Verificar se o usuário pode ser escalado no dia
          if (
            user.assignedCount < user.maxShifts && // Não excedeu o limite de escalas
            user.availableDates.includes(formatDateToISO(availableDate.date)) && // Está disponível no dia
            !assignedUsers.find((u) => u.userId === user.userId) && // Não foi escalado no mesmo dia
            !alreadyAssignedThisRound.has(user.userId) // Não foi escalado nesta rodada
          ) {
            assignedUsers.push({
              userId: user.userId,
              rank: user.rank,
              displayName: user.displayName,
              rg: user.rg,
              nf: user.nf,
              motorista: user.motorista ? "Sim" : "Não",
            });

            user.assignedCount += 1; // Incrementar contador de escalas
            alreadyAssignedThisRound.add(user.userId); // Marcar como escalado nesta rodada
            slotsRemaining--;
          }
        }

        // Adicionar os usuários escalados no dia ao cronograma final
        if (assignedUsers.length > 0) {
          schedule.push({
            date: availableDate.date,
            assignedUsers,
          });
        }
      }

      // Atualizar as filas para próxima rodada
      allUsersQueue = sortedUsers.filter((u) => u.assignedCount < u.maxShifts);
      notYetAssignedQueue = [...allUsersQueue];
      alreadyAssignedThisRound.clear();

      console.log("Escala final gerada:", schedule);
      setGeneratedSchedule(schedule);
      alert("Escala gerada com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar escala:", error);
      alert(`Erro ao gerar escala: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return { generatedSchedule, handleGenerateSchedule, isLoading };
};
