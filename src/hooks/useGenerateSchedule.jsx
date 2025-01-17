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
        const rankA = ranksOrder.indexOf((a.rank || "").toLowerCase());
        const rankB = ranksOrder.indexOf((b.rank || "").toLowerCase());

        if (rankA === -1 || rankB === -1) {
          return rankA === -1 ? 1 : -1;
        }

        if (rankA !== rankB) {
          return rankA - rankB;
        }

        const rgA = parseInt(a.rg, 10);
        const rgB = parseInt(b.rg, 10);

        if (isNaN(rgA) || isNaN(rgB)) {
          return isNaN(rgA) ? 1 : -1;
        }

        return rgB - rgA;
      });

      console.log("Usuários ordenados por antiguidade (após sort):");
      sortedUsers.forEach((user) => {
        console.log(
          `RG: ${user.rg}, Rank: ${user.rank}, DisplayName: ${user.displayName}`
        );
      });

      let notYetAssignedOnce = [...sortedUsers];
      let allUsersQueue = [...sortedUsers];
      let alreadyAssignedThisRound = new Set();

      for (const availableDate of availableDates) {
        const assignedUsers = [];
        let slotsRemaining = availableDate.slots;

        // Primeira rodada: todos devem ser escalados ao menos uma vez
        while (slotsRemaining > 0 && notYetAssignedOnce.length > 0) {
          let user = notYetAssignedOnce.shift();

          if (
            user.assignedCount < user.maxShifts &&
            user.availableDates.includes(formatDateToISO(availableDate.date)) &&
            !assignedUsers.find((u) => u.userId === user.userId)
          ) {
            assignedUsers.push({
              userId: user.userId,
              rank: user.rank,
              displayName: user.displayName,
              rg: user.rg,
              nf: user.nf,
              motorista: user.motorista ? "Sim" : "Não",
            });

            user.assignedCount += 1;
            slotsRemaining--;
          }
        }

        // Segunda e próximas rodadas: priorizar menos escalados e mais modernos
        let notYetAssignedQueue = allUsersQueue.filter(
          (u) => u.assignedCount < u.maxShifts
        );

        while (slotsRemaining > 0) {
          notYetAssignedQueue.sort((a, b) => {
            if (a.assignedCount !== b.assignedCount) {
              return a.assignedCount - b.assignedCount;
            }

            const rankA = ranksOrder.indexOf((a.rank || "").toLowerCase());
            const rankB = ranksOrder.indexOf((b.rank || "").toLowerCase());

            if (rankA !== rankB) {
              return rankA - rankB;
            }

            const rgA = parseInt(a.rg, 10);
            const rgB = parseInt(b.rg, 10);
            return rgB - rgA;
          });

          let user = notYetAssignedQueue.shift();

          if (!user) break;

          if (
            user.assignedCount < user.maxShifts &&
            user.availableDates.includes(formatDateToISO(availableDate.date)) &&
            !assignedUsers.find((u) => u.userId === user.userId)
          ) {
            assignedUsers.push({
              userId: user.userId,
              rank: user.rank,
              displayName: user.displayName,
              rg: user.rg,
              nf: user.nf,
              motorista: user.motorista ? "Sim" : "Não",
            });

            user.assignedCount += 1;
            slotsRemaining--;
          }
        }

        if (assignedUsers.length > 0) {
          schedule.push({
            date: availableDate.date,
            assignedUsers,
          });
        }
      }

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
