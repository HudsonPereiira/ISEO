import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";

export const useAvailableDates = () => {
  const [availableDates, setAvailableDates] = useState([]);

  const fetchAvailableDates = async () => {
    try {
      const datesSnapshot = await getDocs(collection(db, "availableDates"));
      const datesList = datesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Ordenar as datas em ordem crescente antes de armazená-las
      const sortedDatesList = datesList.sort((a, b) => new Date(a.date) - new Date(b.date));

      // Atualizar somente se houver mudanças
      if (JSON.stringify(sortedDatesList) !== JSON.stringify(availableDates)) {
        setAvailableDates(sortedDatesList);
      }
    } catch (error) {
      console.error("Erro ao buscar datas disponíveis:", error);
    }
  };

  useEffect(() => {
    fetchAvailableDates();
  }, []); // Executar somente uma vez ao carregar o componente

  return availableDates;
};
