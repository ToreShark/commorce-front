import { CartItemInterface } from "@/app/lib/interfaces/cart.item.interface";
import { Product } from "../../lib/interfaces/product.interface";
import "../cart-item/cart-item.scss";

interface CartItemProps {
  cartItem: CartItemInterface;
}

const CartItem: React.FC<CartItemProps> = ({ cartItem }) => {
  const { name, price, quantity, imageUrl } = cartItem;

  // Изменяем URL изображения на HTTPS, если оно приходит по HTTP
  const secureImageUrl = imageUrl?.startsWith("http://")
    ? imageUrl.replace("http://", "https://")
    : imageUrl;

  return (
    <div className="cart-item-container">
      {secureImageUrl ? (
        <img src={secureImageUrl} alt="item" />
      ) : (
        <div className="placeholder-image">Нет изображения</div>
      )}
      <div className="item-details">
        <span className="name">{name}</span>
        <span className="price">
          {quantity} x ₸{price}
        </span>
      </div>
    </div>
  );
};

export default CartItem;
