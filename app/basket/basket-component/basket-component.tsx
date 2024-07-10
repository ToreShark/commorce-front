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

  if (cartItems.length === 0) {
    return <div className="empty-cart-message">Ваша корзина пуста. Перейдите в каталог, чтобы начать покупки!</div>;
  }

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

        // Изменяем URL изображения на HTTPS, если оно приходит по HTTP
        const secureImageUrl = imageUrl?.startsWith("http://")
          ? imageUrl.replace("http://", "https://")
          : imageUrl;

        const totalPrice = price * quantity;
        return (
          <div key={productId} className="checkout-item-container">
            <div className="image-container">
              <img src={secureImageUrl} alt={name} />
            </div>
            <span className="name">{name}</span>
            <span className="quantity">
              <div className="quantity-controls">
                <div
                  className="arrow"
                  onClick={() => handleDecrease(uniqueOrderId)}
                >
                  &#10094;
                </div>
                <span className="value">{quantity}</span>
                <div
                  className="arrow"
                  onClick={() => handleIncrease(uniqueOrderId)}
                >
                  &#10095;
                </div>
              </div>
              <span className="price">₸{price}</span>
            </span>

            <span className="price">₸{totalPrice}</span>
            <div
              className="remove-button"
              onClick={() => handleRemove(productId)}
            >
              &#10005;
            </div>
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
