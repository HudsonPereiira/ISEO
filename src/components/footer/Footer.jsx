import styles from "./Footer.module.css";

import React from "react";

const footer = () => {
  return (
    <div className={styles.footer}>
      <span>"Polícia Militar, patrimônio do povo capixaba"</span>

      <span>CEPG - COMPANHIA ESPECIALIZADA DE POLÍCIA DE GUARDA</span>
      <div>
        <p>
          Rua Sete de Setembro, 362 - 2º andar - Centro - CEP: 29.015-000 -
          Vitória/ES
        </p>
        <p>
          Tel: (0xx27) 3636-1358 / 3636-1369 - E-mail:
          adm.ciapguarda@pm.es.gov.br – CNPJ: 27.476.373-0001/90
        </p>
        <p>ISEO &copy; 2025 - Desenvolido por Hudson Pereira Barbosa </p>
      </div>
    </div>
  );
};

export default footer;
