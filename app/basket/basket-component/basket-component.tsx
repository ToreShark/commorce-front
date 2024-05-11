import CartItem from "@/app/components/cart-item/cart-item.component";
import { CartContext } from "@/app/lib/CartContext";
import { decreaseItemQuantity } from "@/app/lib/data";
import { useContext } from "react";

function BasketContent() {
  const { cartItems, setCartItems } = useContext(CartContext);
  
  const handleDecrease = async (uniqueOrderId: string | undefined) => {
    if (uniqueOrderId) {
        const result = await decreaseItemQuantity(uniqueOrderId);
        if (result) {
          // Update local cart state or show a success message
          console.log("Item quantity decreased successfully", result);
          // Optionally refresh the cart items from context or server
        } else {
          // Handle error case, e.g., show an error message
          console.error("Failed to decrease item quantity");
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
              <br/>
              <button onClick={() => handleDecrease(uniqueOrderId)}>Decrement</button>
              <br/>
              <span>increment</span>
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
