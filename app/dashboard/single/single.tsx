// app/dashboard/single/page.tsx
"use client";
import "@/app/dashboard/single/single.scss";

interface SingleProps {
  userId: string;
}

export default function Single({ userId }: SingleProps) {
  return (
    <div className="single">
      <div className="singleContainer">
        <div className="top">
          <div className="left">
            <h1 className="title">Информация</h1>
            <div className="item">
                <div className="details">
                    <h1 className="itemTitle">Name User</h1>
                    <div className="detailItem">
                        <span className="itemKey">Телефон:</span>
                        <span className="itemValue">+77073816081</span>
                    </div>
                    <div className="detailItem">
                        <span className="itemKey">Почта:</span>
                        <span className="itemValue">exmaple@gmail.com</span>
                    </div>
                </div>
            </div>
          </div>
          <div className="right"></div>
        </div>
        <div className="bottom"></div>
        Hello World!
      </div>
    </div>
  );
}
