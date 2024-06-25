// create component Table
"use client";
import React, { useEffect, useState } from "react";
import "@/app/dashboard/table/table.scss";
import { getUsersWithLastTransactions } from "@/app/lib/data";
import Cookies from "js-cookie";
import BasicTable from "./BasicTable";

const Table = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = Cookies.get("token"); // замените на фактический токен авторизации
        if (token) {
          const data = await getUsersWithLastTransactions(token);
          setUsers(data);
          console.log("Users with last transactions:", data);
        } else {
          console.error("Token not found");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);
  return (
    <div className="table">
      <BasicTable users={users} />
    </div>
  );
};

export default Table;
