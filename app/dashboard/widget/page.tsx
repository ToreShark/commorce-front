//app/dashboard/widget/page.tsx
import "@/app/dashboard/widget/widget.scss";
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

export default function Page() {
    return (
        <div className="widget">
         <div className="left">
            <span className="title">Пользователи</span>
            <span className="counter">231234</span>
            <span className="link">Увидеть всех пользователей</span>
         </div>
         <div className="right">
            <div className="widget-percentage positive">
                <KeyboardArrowUpIcon />
                20%</div>
            <PersonOutlineIcon className="icon"/>
         </div>
        </div>
      );
}