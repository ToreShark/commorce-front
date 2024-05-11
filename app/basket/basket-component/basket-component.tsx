import CartItem from "@/app/components/cart-item/cart-item.component";
import { CartContext } from "@/app/lib/CartContext";
import {
  decreaseItemQuantity,
  fetchCartInfo,
  increaseItemQuantity,
  removeItemFromCart,
} from "@/app/lib/data";
import { useContext, useEffect } from "react";
import "@/app/basket/basket-component/checkout-item.styles.scss";

function BasketContent() {
  const { cartItems, setCartItems, cartCount, setCartCount } =
    useContext(CartContext);

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
        }
      } else {
        console.error("Failed to increase item quantity");
      }
    } else {
      console.error("Unique order ID is undefined");
    }
  };
  const handleRemove = async (productId: string) => {
    if (productId) {
      const result = await removeItemFromCart(productId);
      // Проверяем, содержит ли результат сообщение об успешном удалении
      if (result && result.message === "Item removed successfully.") {
        // После успешного удаления обновляем данные корзины
        const updatedCartData = await fetchCartInfo();
        if (updatedCartData) {
          setCartItems(updatedCartData.items);
          setCartCount(updatedCartData.totalCount);
        }
      } else {
        console.error("Failed to remove item");
      }
    } else {
      console.error("Product ID is undefined");
    }
  };

  return (
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

        const totalPrice = price * quantity;
        return (
          <div key={productId} className="checkout-item-container">
            <div className="image-container">
              <img src={imageUrl} alt={name} />
            </div>
            <span className="name">{name}</span>
            <span className="quantity">{quantity}</span>
            <span className="price">₸{totalPrice}</span>
            <div
              className="remove-button"
              onClick={() => handleRemove(productId)}
            >
              &#10005;
            </div>
            {/* <span>{uniqueOrderId}</span> */}
            {/* <span>{selectedProperties}</span> */}
            {/* <br /> */}
            {/* <button onClick={() => handleDecrease(uniqueOrderId)}>
              Decrement
            </button> */}
            {/* <br />
            <button onClick={() => handleIncrease(uniqueOrderId)}>
              Increment
            </button> */}
            {/* <ul>
              {properties &&
                Object.entries(properties).map(([key, values]) => (
                  <li key={key}>
                    {key}: {values.join(", ")}
                  </li>
                ))}
            </ul> */}
          </div>
        );
      })}
    </div>
  );
}

export default BasketContent;
