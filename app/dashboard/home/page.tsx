import "@/app/dashboard/home/home.scss";
import SideBar from "../sidebar/page";
import Widget from "../widget/page";
export default function Page() {
  return (
  <div className="home">
    <SideBar />
    <div className="homeContainer">
      <div className="widgets">
        <Widget />
        <Widget />
        <Widget />
        <Widget />
      </div>
    </div>
  </div>
  );
}
