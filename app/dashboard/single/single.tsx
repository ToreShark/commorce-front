// app/dashboard/single/page.tsx
"use client";
import "@/app/dashboard/single/single.scss";
import { getUserById } from "@/app/lib/data";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { UserByIdOrders } from "../chart/userByIdOrders";
import { UsersByDayChart } from "../chart/UsersByDayChart";
import { format } from "date-fns"; 

interface SingleProps {
  userId: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roleId: number;
  roleName: string;
  registrationDate: string;
  lastActiveDate: string;
  orders: Order[];
}

interface Order {
  orderId: string;
  customerName: string;
  cellPhone: string;
  referenceId: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    selectedPropertiesJson: string;
    itemTotalPrice: number;
  }[];
  totalPrice: number;
  orderDate: string;
  status: string;
  delivery: string | null;
  payment: string | null;
  deliveryAddress: string | null;
}

export default function Single({ userId }: SingleProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = Cookies.get("token");
      if (token) {
        try {
          const userData = await getUserById(userId, token);
          userData.registrationDate = format(new Date(userData.registrationDate), 'dd-MM-yyyy');
          userData.lastActiveDate = format(new Date(userData.lastActiveDate), 'dd-MM-yyyy');
          setUser(userData);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        console.error("Token not found");
      }
    };

    fetchUser();
  }, [userId]);

  if (!user) {
    return <div>Loading...</div>;
  }
  return (
    <div className="single">
      <div className="singleContainer">
        <div className="top">
          <div className="left">
            <h1 className="title">Информация</h1>
            <div className="item">
                <div className="details">
                <h1 className="itemTitle">{`${user.firstName} ${user.lastName}`}</h1>
                    <div className="detailItem">
                        <span className="itemKey">Телефон:</span>
                        <span className="itemValue">{user.phone}</span>
                    </div>
                    <div className="detailItem">
                        <span className="itemKey">Почта:</span>
                        <span className="itemValue">{user.email}</span>
                    </div>
                    <div className="detailItem">
                        <span className="itemKey">Роль:</span>
                        <span className="itemValue">{user.roleId}</span>
                    </div>
                    <div className="detailItem">
                        <span className="itemKey">Дата регистрации:</span>
                        <span className="itemValue">{user.registrationDate}</span>
                    </div>
                    <div className="detailItem">
                        <span className="itemKey">Последняя активность:</span>
                        <span className="itemValue">{user.lastActiveDate}</span>
                    </div>
                </div>
            </div>
          </div>
          <div className="right">
            <UserByIdOrders userId={userId}/> 
          </div>
        </div>
        <div className="bottom"></div>
        Hello World!
      </div>
    </div>
  );
}
