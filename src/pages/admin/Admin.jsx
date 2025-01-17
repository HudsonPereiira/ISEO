import styles from "./Admin.module.css";

import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from "date-fns/locale";

// Hooks
import { useUserRequests } from "../../hooks/useUserRequests";
import { useAddDate } from "../../hooks/useAddDate";
import { useGenerateSchedule } from "../../hooks/useGenerateSchedule";
import { useExportToWord } from "../../hooks/useExportToWord";

const Admin = () => {
  const [availableDates, setAvailableDates] = useState([]);
  const {
    date,
    setDate,
    slots,
    setSlots,
    handleAddDate,
    handleDeleteDate,
    fetchAvailableDates,
  } = useAddDate(
    (newDate) =>
      setAvailableDates((prevDates) =>
        [...prevDates, newDate].sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        )
      ),
    (deletedId) =>
      setAvailableDates((prevDates) =>
        prevDates
          .filter((d) => d.id !== deletedId)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
      )
  );
  const userRequests = useUserRequests();
  const { generatedSchedule, handleGenerateSchedule } = useGenerateSchedule(
    availableDates,
    userRequests
  );
  const { exportToWord } = useExportToWord();

  useEffect(() => {
    const loadDates = async () => {
      try {
        const dates = await fetchAvailableDates();
        const sortedDates = dates.sort((a, b) => new Date(a.date) - new Date(b.date));
        setAvailableDates((prevDates) => {
          // Evita atualizar o estado desnecessariamente
          if (JSON.stringify(sortedDates) !== JSON.stringify(prevDates)) {
            return sortedDates;
          }
          return prevDates;
        });
      } catch (error) {
        console.error("Erro ao carregar as datas disponíveis:", error);
      }
    };

    loadDates();
  }, []); // Array vazio para evitar reexecução desnecessária

  const handleAddDateSubmit = (e) => {
    e.preventDefault();
    handleAddDate(date, slots);
  };

  return (
    <div>
      <section>
        <h1>Escala de ISEO</h1>
        <h3>Adicionar Datas com Vagas</h3>
        <form onSubmit={handleAddDateSubmit}>
          <label>Data:</label>
          <DatePicker
            selected={date}
            onChange={(d) => setDate(d)}
            dateFormat="dd/MM/yyyy"
            locale={ptBR}
            placeholderText="Selecione uma data"
            minDate={new Date()}
          />
          <label>Vagas:</label>
          <input
            type="number"
            min="1"
            value={slots}
            onChange={(e) => setSlots(e.target.value)}
            placeholder="Número de vagas"
          />
          <button className="btn" type="submit">
            Adicionar
          </button>
        </form>
      </section>

      <section>
        <h3>Datas Disponíveis</h3>
        {availableDates.length > 0 ? (
          <ul>
            {availableDates
              .sort((a, b) => {
                // Converte "dd/mm/yyyy" para "yyyy-mm-dd" antes de criar o objeto Date
                const dateA = new Date(a.date.split('/').reverse().join('-'));
                const dateB = new Date(b.date.split('/').reverse().join('-'));
                return dateA - dateB;
              })
              
              .map((date) => (
                <li key={date.id}>
                  <span>
                    {date.date} - {date.slots} vaga(s)
                  </span>
                  <button
                    className="btn_delete"
                    onClick={() => handleDeleteDate(date.id)}
                  >
                    Excluir
                  </button>
                </li>
              ))}
          </ul>
        ) : (
          <p>Nenhuma data disponível.</p>
        )}
      </section>

      <section>
        <button className="btn" onClick={handleGenerateSchedule}>
          Escalar
        </button>
        {generatedSchedule.length > 0 && (
          <div>
            <h4>Escala Gerada:</h4>
            {generatedSchedule.map((schedule, index) => (
              <div key={index} className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th colSpan="5">
                        <h5>Data: {schedule.date}</h5>
                      </th>
                    </tr>
                    <tr>
                      <th>Graduação</th>
                      <th>Nome Completo</th>
                      <th>RG</th>
                      <th>NF</th>
                      <th>Motorista</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.assignedUsers.length > 0 ? (
                      schedule.assignedUsers.map((user, userIndex) => (
                        <tr key={userIndex}>
                          <td>{user.rank}</td>
                          <td>{user.displayName}</td>
                          <td>{user.rg}</td>
                          <td>{user.nf}</td> {/* Verifica se o NF existe */}
                          <td>{user.motorista}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5">Sem voluntários disponíveis</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ))}

            <div className={styles.btn}>
              <button
                className="btn"
                onClick={() => exportToWord(generatedSchedule)}
              >
                Download
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Admin;
