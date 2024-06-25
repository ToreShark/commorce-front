//app/dashboard/home/page.tsx
import "@/app/dashboard/home/home.scss";
import Chart from "../chart/chart";
import Featured from "../featured/featured";
import SideBar from "../sidebar/page";
import Table from "../table/table";
import Widget from "../widget/Widget";
export default function Page() {
  return (
  <div className="home">
    <SideBar />
    <div className="homeContainer">
      <div className="widgets">
        <Widget type = "categories"/>
        <Widget type = "user"/>
        <Widget type = "order"/>
        <Widget type = "balance"/>
      </div>
      <div className="charts">
        <Featured />
        <Chart />
      </div>
      <div className="listContainer">
        <div className="listTitle">Последние транзакций</div>
        <Table />
      </div>
    </div>
  </div>
  );
}
