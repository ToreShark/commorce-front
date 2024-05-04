"use client";
import {createContext, useState} from 'react';

export const CartContext = createContext({
    isCartOpen: false,
    setIsCartOpen: (value: boolean) => {},
});

export const CartProvider = ({children}: {children: React.ReactNode}) => {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const value = {isCartOpen, setIsCartOpen};
    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    )
};