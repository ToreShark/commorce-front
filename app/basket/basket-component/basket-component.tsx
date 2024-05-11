import CartItem from "@/app/components/cart-item/cart-item.component";
import { CartContext } from "@/app/lib/CartContext";
import { decreaseItemQuantity, fetchCartInfo, increaseItemQuantity } from "@/app/lib/data";
import { useContext, useEffect } from "react";

function BasketContent() {
  const { cartItems, setCartItems, cartCount, setCartCount } = useContext(CartContext);

  useEffect(() => {
    // Загрузка данных о корзине при монтировании компонента
    const loadCartData = async () => {
      const cartData = await fetchCartInfo();
      if (cartData) {
        setCartItems(cartData.items);
        setCartCount(cartData.totalCount);
      }
    };

    loadCartData();
  }, []);

  const handleDecrease = async (uniqueOrderId: string | undefined) => {
    if (uniqueOrderId) {
      const result = await decreaseItemQuantity(uniqueOrderId);
      if (result) {
        // После успешного уменьшения количества обновляем данные корзины
        const updatedCartData = await fetchCartInfo();
        if (updatedCartData) {
          setCartItems(updatedCartData.items);
          setCartCount(updatedCartData.totalCount);
          console.log("Item quantity decreased successfully", result);
        }
      } else {
        console.error("Failed to decrease item quantity");
      }
    } else {
      console.error("Unique order ID is undefined");
    }
  };
  const handleIncrease = async (uniqueOrderId: string | undefined) => {
    if (uniqueOrderId) {
      const result = await increaseItemQuantity(uniqueOrderId);
      if (result) {
        // После успешного увеличения количества обновляем данные корзины
        const updatedCartData = await fetchCartInfo();
        if (updatedCartData) {
          setCartItems(updatedCartData.items);
          setCartCount(updatedCartData.totalCount);
          console.log("Item quantity increased successfully", result);
        }
      } else {
        console.error("Failed to increase item quantity");
      }
    } else {
      console.error("Unique order ID is undefined");
    }
  };  
  return (
    <div>
      <div>Страница корзины</div>
      <div>
        {cartItems.map((cartItem) => {
          // Деструктуризация внутри return
          const {
            uniqueOrderId,
            productId,
            name,
            price,
            quantity,
            selectedProperties,
            imageUrl,
            properties,
          } = cartItem;
          return (
            <div key={productId}>
              <h2>{name}</h2>
              <span>₸{price}</span>
              <span>{quantity}</span>
              <span>{uniqueOrderId}</span>
              <span>{selectedProperties}</span>
              <br />
              <button onClick={() => handleDecrease(uniqueOrderId)}>
                Decrement
              </button>
              <br />
              <button onClick={() => handleIncrease(uniqueOrderId)}>
                Increment
              </button>
              <img src={imageUrl} alt={name} />
              <ul>
                {properties &&
                  Object.entries(properties).map(([key, values]) => (
                    <li key={key}>
                      {key}: {values.join(", ")}
                    </li>
                  ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BasketContent;
