import { Button } from "@/components/ui/button";

const CartDropdown = () => {
    return (
        <div className="absolute w-60 h-[340px] flex flex-col p-5 border-2 border-black bg-white top-[90px] right-20 z-10">
            <div className="h-60 flex flex-col overflow-y-scroll"/>
            <Button>Оплатить</Button>
        </div>
    )
};

export default CartDropdown;