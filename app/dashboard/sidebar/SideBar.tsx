"use client";
import "@/app/dashboard/sidebar/sidebar.scss";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ProductionQuantityLimitsIcon from "@mui/icons-material/ProductionQuantityLimits";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import SouthAmericaIcon from "@mui/icons-material/SouthAmerica";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CircleNotificationsIcon from "@mui/icons-material/CircleNotifications";
import SensorWindowIcon from "@mui/icons-material/SensorWindow";
import ContactEmergencyIcon from "@mui/icons-material/ContactEmergency";

type PageType = "home" | "users" | "single" | "products";

interface SideBarProps {
  // Изменение типа в SideBar на более строгий (PageType вместо string) 
  setActivePage: (page: PageType) => void;
}

const SideBar: React.FC<SideBarProps> = ({ setActivePage }) => {
  return (
    <div className="sidebar">
      <div className="top">
        <span className="logo">logo</span>
      </div>
      <hr />
      <div className="center">
        <ul>
          <p className="title">Главная</p>
          <li onClick={() => setActivePage("home")}>
            <DashboardIcon className="icon" />
            <span>Админ Панель</span>
          </li>
          <p className="title">Ссылки/инструменты</p>
          <li onClick={() => setActivePage("users")}>
            <PeopleAltIcon className="icon" />
            <span>Пользователи</span>
          </li>
          <li onClick={() => setActivePage("products")}>
            <ProductionQuantityLimitsIcon className="icon" />
            <span>Товары</span>
          </li>
          <li>
            <CreditCardIcon className="icon" />
            <span>Заказы</span>
          </li>
          <li>
            <SouthAmericaIcon className="icon" />
            <span>Области</span>
          </li>
          <li>
            <LocationCityIcon className="icon" />
            <span>Города</span>
          </li>
          <li>
            <LocalShippingIcon className="icon" />
            <span>Доставка</span>
          </li>
          <p className="title">Сервисы</p>
          <li>
            <CircleNotificationsIcon className="icon" />
            <span>Уведомления</span>
          </li>
          <li>
            <SensorWindowIcon className="icon" />
            <span>Система</span>
          </li>
          <p className="title">Пользователь Админ</p>
          <li>
            <ContactEmergencyIcon className="icon" />
            <span>Профиль</span>
          </li>
        </ul>
      </div>
      <div className="bottom">
        <div className="colorOption"></div>
        <div className="colorOption"></div>
      </div>
    </div>
  );
};

export default SideBar;
