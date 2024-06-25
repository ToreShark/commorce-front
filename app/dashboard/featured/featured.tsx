//app/dashboard/featured/featured.tsx
import "@/app/dashboard/featured/featured.scss";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import CircularProgressbar from "./CircularProgressbar";

export default function Featured() {
  return (
    <div className="featured">
      <div className="top">
        <h1 className="title">Общий доход</h1>
        <MoreVertIcon fontSize="small" className="icon" />
      </div>
      <div className="bottom">
        <div className="featuredChart">
          <CircularProgressbar value={75} text="75%" />
        </div>
        <p className="title">Продажи за сегодня</p>
        <p className="amount">420 ₸</p>
        <p className="desc">
          Обработка предыдущих транзакций. Последние платежи могут не быть
          включены.
        </p>
        <div className="summary">
          <div className="item">
            <div className="itemTitle">Цель</div>
            <div className="itemsResult negative">
              <KeyboardArrowDownIcon fontSize="small" />
              <div className="resultAmount">40 000 ₸</div>
            </div>
          </div>
          <div className="item">
            <div className="itemTitle">Неделя</div>
            <div className="itemsResult positive">
              <KeyboardArrowUpIcon fontSize="small" />
              <div className="resultAmount">40 000 ₸</div>
            </div>
          </div>
          <div className="item">
            <div className="itemTitle">Месяц</div>
            <div className="itemsResult positive">
              <KeyboardArrowUpIcon fontSize="small" />
              <div className="resultAmount">40 000 ₸</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
