import styles from "./SetForm.module.css"

import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from "date-fns/locale";
import { db, auth } from "../../firebase/config";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { format, parse } from "date-fns";

const SetForm = () => {
  const [selectedDates, setSelectedDates] = useState([]);
  const [dates, setDates] = useState([]);
  const [situacaoFerias, setSituacaoFerias] = useState(""); // Renomeado
  const [motorista, setMotorista] = useState("");
  const [quantasEscalas, setQuantasEscalas] = useState(""); // Novo estado
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = auth.currentUser;
  const today = new Date();

  const handleDateChange = (date) => {
    if (!date) return;

    const newDates = [...selectedDates];
    const dateString = date.toLocaleDateString("pt-BR");

    const dateIndex = newDates.findIndex((d) => d === dateString);

    if (dateIndex === -1) {
      newDates.push(dateString);
    } else {
      newDates.splice(dateIndex, 1);
    }

    setSelectedDates(newDates);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      selectedDates.length === 0 ||
      !situacaoFerias ||
      !motorista ||
      !quantasEscalas
    ) {
      alert("Por favor, preencha todos os campos e selecione as datas.");
      return;
    }

    if (!user) {
      alert("Você precisa estar logado para enviar as datas!");
      return;
    }

    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      const datesCollection = collection(db, "userDates");

      const uniqueSelectedDates = [...new Set(selectedDates)];

      for (const date of uniqueSelectedDates) {
        const dateExists = dates.some(
          (dateData) => dateData.selectedDate === date
        );
        if (dateExists) {
          continue;
        }

        await addDoc(datesCollection, {
          userId: user.uid,
          selectedDate: date,
          situacaoFerias, // Atualizado
          motorista,
          quantasEscalas, // Novo dado
          createdAt: new Date(),
        });
      }

      alert("Dados salvos com sucesso!");
      setSelectedDates([]);
      fetchDates();
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchDates = async () => {
    try {
      const userDatesSnapshot = await getDocs(collection(db, "userDates"));
      const userDatesList = userDatesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const filteredDates = userDatesList.filter(
        (dateData) => dateData.userId === user.uid
      );

      const sortedDates = filteredDates.sort((a, b) => {
        const dateA = parse(a.selectedDate, "dd/MM/yyyy", new Date());
        const dateB = parse(b.selectedDate, "dd/MM/yyyy", new Date());
        return dateA - dateB;
      });

      setDates(sortedDates);
    } catch (error) {
      console.error("Erro ao recuperar as datas:", error);
    }
  };

  const handleDeleteDate = async (dateId) => {
    if (!dateId) {
      console.error("Erro: dateId não foi fornecido.");
      return;
    }

    try {
      const dateDocRef = doc(db, "userDates", dateId);
      await deleteDoc(dateDocRef);
      fetchDates();
    } catch (error) {
      console.error("Erro ao excluir data:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDates();
    }
  }, [user]);

  const isDateDisabled = (date) => {
    const dateString = date.toLocaleDateString("pt-BR");
    return dates.some((dateData) => dateData.selectedDate === dateString);
  };

  const getDayClassName = (date) => {
    const dateString = date.toLocaleDateString("pt-BR");
    return selectedDates.includes(dateString)
      ? "react-datepicker__day--selected"
      : "";
  };

  return (
    <div className="dates">
      <form onSubmit={handleSubmit}>
        <div>
          <h1>Selecione as Datas</h1>
          <div>
            <DatePicker
              selected={null}
              onChange={handleDateChange}
              inline
              dateFormat="dd/MM/yyyy"
              locale={ptBR}
              placeholderText="Selecione uma data"
              minDate={today}
              filterDate={(date) => {
                return (
                  date.getMonth() === currentMonth.getMonth() &&
                  date.getFullYear() === currentMonth.getFullYear()
                );
              }}
              onMonthChange={(date) => setCurrentMonth(date)}
              dayClassName={getDayClassName}
              disabled={isDateDisabled}
            />
          </div>
        </div>

        <div>
          <h3>Quantas vezes deseja ser escalado?</h3>
          <select
            className="select"
            onChange={(e) => setQuantasEscalas(e.target.value)}
            value={quantasEscalas}
          >
            <option value="">Selecione</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </div>

        <div>
          <h3>Situação de férias</h3>
          <select
            className="select"
            onChange={(e) => setSituacaoFerias(e.target.value)}
            value={situacaoFerias}
          >
            <option value="">Selecione</option>
            <option value="Entrando">Entrando</option>
            <option value="Retornando">Retornando</option>
            <option value="Não se aplica">Não se aplica</option>
          </select>
        </div>

        <div>
          <h3>Motorista?</h3>
          <select
            className="select"
            onChange={(e) => setMotorista(e.target.value)}
            value={motorista}
          >
            <option value="">Selecione</option>
            <option value="Sim">Sim</option>
            <option value="Não">Não</option>
          </select>
        </div>

        <button className="btn" type="submit" disabled={isSubmitting}>
          Salvar Dados
        </button>
      </form>

      <div>
        <h3>Suas Datas</h3>
        {dates.length > 0 ? (
          <ul>
            {dates.map((dateData) => (
              <div key={dateData.id}>
                <span>{dateData.selectedDate}</span>
                <button
                  className="btn_delete"
                  onClick={() => handleDeleteDate(dateData.id)}
                >
                  Excluir
                </button>
              </div>
            ))}
          </ul>
        ) : (
          <p>Você ainda não tem datas registradas.</p>
        )}
      </div>
    </div>
  );
};

export default SetForm;
