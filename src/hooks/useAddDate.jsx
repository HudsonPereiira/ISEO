import { useState } from "react";
import { db } from "../firebase/config";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { format } from "date-fns";

export const useAddDate = (onDateAdded, onDateDeleted) => {
  const [date, setDate] = useState(null);
  const [slots, setSlots] = useState("");

  const handleAddDate = async () => {
    if (!date || !slots || isNaN(Number(slots)) || Number(slots) <= 0) {
      alert("Por favor, insira uma data válida e um número de vagas maior que zero.");
      return;
    }

    const dateString = format(date, "dd/MM/yyyy");

    try {
      const docRef = await addDoc(collection(db, "availableDates"), {
        date: dateString,
        slots: Number(slots),
      });

      if (onDateAdded) {
        onDateAdded({ id: docRef.id, date: dateString, slots: Number(slots) });
      }

      setDate(null);
      setSlots("");
    } catch (error) {
      console.error("Erro ao adicionar data:", error);
      alert("Erro ao adicionar a data. Tente novamente.");
    }
  };

  const handleDeleteDate = async (id) => {
    try {
      await deleteDoc(doc(db, "availableDates", id));
      if (onDateDeleted) {
        onDateDeleted(id);
      }
    } catch (error) {
      console.error("Erro ao excluir data:", error);
      alert("Erro ao excluir a data. Tente novamente.");
    }
  };

  const fetchAvailableDates = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "availableDates"));
      const dates = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return dates;
    } catch (error) {
      console.error("Erro ao carregar datas:", error);
      alert("Erro ao carregar as datas. Tente novamente.");
      return [];
    }
  };

  return { date, setDate, slots, setSlots, handleAddDate, handleDeleteDate, fetchAvailableDates };
};
