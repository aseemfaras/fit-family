"use client";

import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load cart from localStorage
    useEffect(() => {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save cart to localStorage
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("cart", JSON.stringify(cart));
        }
    }, [cart, isLoaded]);

    const addToCart = (product) => {
        const existing = cart.find((item) => item.id === product.id);
        if (existing) {
            toast.success(`Updated quantity for ${product.name}`);
            setCart((prev) =>
                prev.map((item) =>
                    item.id === product.id
                        ? { ...item, qty: item.qty + 1 }
                        : item
                )
            );
        } else {
            toast.success(`Added ${product.name} to cart`);
            setCart((prev) => [...prev, { ...product, qty: 1 }]);
        }
    };

    const updateQty = (id, script) => {
        // script can be number or function
        setCart((prev) =>
            prev.map((item) => {
                if (item.id === id) {
                    const newQty = typeof script === "function" ? script(item.qty) : script;
                    return { ...item, qty: Math.max(1, newQty) };
                }
                return item;
            })
        );
    };

    const removeFromCart = (id) => {
        setCart((prev) => prev.filter((item) => item.id !== id));
        toast.success("Item removed from cart");
    };

    const clearCart = () => {
        setCart([]);
        localStorage.removeItem("cart");
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + item.price * item.qty, 0);
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                updateQty,
                removeFromCart,
                clearCart,
                getCartTotal,
                isLoaded,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
