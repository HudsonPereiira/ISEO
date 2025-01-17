import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const formatDate = (date) => {
  const parsedDate = new Date(date);
  if (parsedDate.toString() === "Invalid Date") {
    return "Data inválida";
  }
  return format(parsedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
};
