import { CartContext } from "@/app/lib/CartContext";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { useContext, useEffect } from "react";
import CartItem from "../cart-item/cart-item.component";

const CartDropdown = ({ onMobileClose } : {onMobileClose : any}) => {
  const { cartItems, setIsCartOpen } = useContext(CartContext);
  const router = useRouter();

  useEffect(() => {
    // Таймер на 5 секунд для закрытия корзины
    const timer = setTimeout(() => {
      setIsCartOpen(false);
      if (onMobileClose) onMobileClose();
    }, 4000);

    // Очистка таймера при размонтировании компонента или изменении состояния
    return () => clearTimeout(timer);
  }, [setIsCartOpen]);
  
  const handleCheckout = () => {
    router.push('/basket')
    setIsCartOpen(false);
  };

  return (
    <div className="absolute w-60 h-[340px] flex flex-col p-5 border-2 border-black bg-white top-[90px] right-20 z-10">
      <div className="h-60 flex flex-col overflow-y-scroll">
        {Array.isArray(cartItems) && cartItems.length > 0 ? (
          cartItems.map((cartItem) => (
            <CartItem key={cartItem.productId} cartItem={cartItem} />
          ))
        ) : (
          <span className="text-center text-gray-500">Корзина пуста</span>
        )}
      </div>
      <Button onClick={handleCheckout}>Оплатить</Button>
    </div>
  );
};

export default CartDropdown;
