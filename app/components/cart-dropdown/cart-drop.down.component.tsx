import { CartContext } from "@/app/lib/CartContext";
import { Button } from "@/components/ui/button";
import { useContext } from "react";
import CartItem from "../cart-item/cart-item.component";

const CartDropdown = () => {
    const {cartItems} = useContext(CartContext);
    return (
        <div className="absolute w-60 h-[340px] flex flex-col p-5 border-2 border-black bg-white top-[90px] right-20 z-10">
            <div className="h-60 flex flex-col overflow-y-scroll">
                {cartItems.map((item) => (
                    <CartItem key={item.id} cartItem={item} /> 
                ))}
            </div>
            <Button>Оплатить</Button>
        </div>
    )
};

export default CartDropdown;