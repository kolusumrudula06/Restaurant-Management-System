import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'foodhub_cart_items';
const DELIVERY_FEE = 30.00;
const TAX_RATE = 0.05; // 5% GST

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.warn('Failed to parse cart items from storage:', err);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.warn('Failed to save cart items to storage:', err);
    }
  }, [items]);

  // Add item or increment quantity
  const addToCart = (product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          image_url: product.image_url,
          category: product.category,
          is_vegetarian: product.is_vegetarian,
          quantity: quantity,
        },
      ];
    });
  };

  // Update item quantity
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Remove single item
  const removeFromCart = (productId) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  };

  // Clear entire cart
  const clearCart = () => {
    setItems([]);
  };

  // Check if item is in cart
  const getItemQuantity = (productId) => {
    const found = items.find((item) => item.id === productId);
    return found ? found.quantity : 0;
  };

  // Calculations
  const { totalItemsCount, subtotal, tax, deliveryFee, grandTotal } = useMemo(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const sub = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const calculatedTax = Math.round(sub * TAX_RATE * 100) / 100;
    const fee = count > 0 ? DELIVERY_FEE : 0;
    const total = Math.round((sub + calculatedTax + fee) * 100) / 100;

    return {
      totalItemsCount: count,
      subtotal: Math.round(sub * 100) / 100,
      tax: calculatedTax,
      deliveryFee: fee,
      grandTotal: total,
    };
  }, [items]);

  const value = {
    items,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getItemQuantity,
    totalItemsCount,
    subtotal,
    tax,
    deliveryFee,
    grandTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
