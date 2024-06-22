//app/dashboard/home/page.tsx
import "@/app/dashboard/home/home.scss";
import SideBar from "../sidebar/page";
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
    </div>
  </div>
  );
}
