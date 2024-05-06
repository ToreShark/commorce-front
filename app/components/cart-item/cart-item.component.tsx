import { CartItemInterface } from '@/app/lib/interfaces/cart.item.interface';
import { Product } from '../../lib/interfaces/product.interface'
import '../cart-item/cart-item.scss';

interface CartItemProps {
    cartItem: CartItemInterface;
}

const CartItem: React.FC<CartItemProps> = ({ cartItem }) => {
    const { name, price, quantity, imageUrl } = cartItem;
    return (
        <div className='cart-item-container'>
            <img src={imageUrl} alt='item' />
            <div className='item-details'>
                <span className='name'>{name}</span>
                <span className='price'>{quantity} x ₸{price}</span>
            </div>
        </div>
    );
}

export default CartItem;