    "use client";
    import {createContext, useEffect, useState} from 'react';
    import CartItem from '../components/cart-item/cart-item.component';
import { CartItemInterface } from './interfaces/cart.item.interface';

    
    type CartItemsArray = CartItemInterface[];

    const addCartItem = (CartItems: CartItemsArray, productToAdd: CartItemInterface) => {
        //find if cartItems contains productToAdd
        const existingCartItem = CartItems.find((cartItem) => cartItem.id === productToAdd.id);
        //if found, increment quantity
        if (existingCartItem) {
            return CartItems.map((cartItem) =>
                cartItem.id === productToAdd.id
                    ? {...cartItem, quantity: cartItem.quantity + 1}
                    : cartItem
            );
        }
        //return new array with mofified cartItems/ new cartItems
        return [...CartItems, {...productToAdd, quantity: 1}];
    };

    export const CartContext = createContext<{
        isCartOpen: boolean;
        setIsCartOpen: (value: boolean) => void;
        cartItems: CartItemsArray;
        addItemToCart: (item: CartItemInterface) => void;
        cartCount: number;
    }>({
        isCartOpen: false,
        setIsCartOpen: () => {},  // Определение как noop для начального значения
        cartItems: [],
        addItemToCart: () => {},
        cartCount: 0,
    });
    

    export const CartProvider = ({children}: {children: React.ReactNode}) => {
        const [isCartOpen, setIsCartOpen] = useState(false);
        const [cartItems, setCartItems] = useState<CartItemsArray>([]);
        const [cartCount, setCartCount] = useState(0);

        useEffect(() => {
            const newCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
            setCartCount(newCartCount);
        }, [cartItems]);

        const addItemToCart = (productToAdd: CartItemInterface) => {
            setCartItems(addCartItem(cartItems, productToAdd));
        };


        const value = {isCartOpen, setIsCartOpen, addItemToCart, cartItems, cartCount};
        return (
            <CartContext.Provider value={value}>
                {children}
            </CartContext.Provider>
        )
    };