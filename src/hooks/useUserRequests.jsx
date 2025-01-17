import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";

export const useUserRequests = () => {
  const [userRequests, setUserRequests] = useState([]);

  const fetchUserRequests = async () => {
    try {
      const userRequestsSnapshot = await getDocs(collection(db, "userDates"));
      const userRequestsList = userRequestsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUserRequests(userRequestsList);
    } catch (error) {
      console.error("Erro ao buscar dados dos usuários:", error);
    }
  };

  useEffect(() => {
    fetchUserRequests();
  }, []);

  return userRequests;
};
