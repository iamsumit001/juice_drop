import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const FREE_DELIVERY_THRESHOLD = 299;
const DELIVERY_FEE = 49;
const TAX_RATE = 0.05;

const getUnitPrice = (item, quantity) => {
  const applicableTier = (item.priceTiers || [])
    .filter((tier) => quantity >= tier.minQuantity)
    .sort((a, b) => b.minQuantity - a.minQuantity)[0];

  return applicableTier ? applicableTier.unitPrice : item.price;
};

const getSizePricing = (product, size) => {
  const pricing = (product.sizePrices || []).find((variant) => variant.size === size);
  return pricing || { size, price: product.price, priceTiers: [] };
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    const stored = localStorage.getItem("juicedrop_cart");
    return stored ? JSON.parse(stored) : [];
  });
  const [coupon, setCoupon] = useState(() => localStorage.getItem("juicedrop_coupon") || "");

  useEffect(() => {
    localStorage.setItem("juicedrop_cart", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem("juicedrop_coupon", coupon);
  }, [coupon]);

  const addItem = (product, size, quantity = 1) => {
    setItems((prev) => {
      const key = `${product._id}-${size}`;
      const existing = prev.find((i) => i.key === key);
      const pricing = getSizePricing(product, size);
      if (existing) {
        return prev.map((i) => (i.key === key
          ? {
            ...i,
            price: pricing.price,
            priceTiers: pricing.priceTiers || [],
            quantity: i.quantity + quantity,
          }
          : i));
      }
      return [
        ...prev,
        {
          key,
          productId: product._id,
          name: product.name,
          image: product.image,
          price: pricing.price,
          priceTiers: pricing.priceTiers || [],
          size,
          quantity,
        },
      ];
    });
  };

  const removeItem = (key) => setItems((prev) => prev.filter((i) => i.key !== key));

  const updateQuantity = (key, quantity) => {
    if (quantity < 1) return removeItem(key);
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, quantity } : i)));
  };

  const clearCart = () => {
    setItems([]);
    setCoupon("");
  };

  const applyCoupon = (code) => {
    if (code.toUpperCase() === "JUICE10") {
      setCoupon("JUICE10");
      return true;
    }
    return false;
  };

  const removeCoupon = () => setCoupon("");

  const subtotal = items.reduce((sum, i) => sum + getUnitPrice(i, i.quantity) * i.quantity, 0);
  const discount = coupon === "JUICE10" ? subtotal * 0.1 : 0;
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : DELIVERY_FEE;
  const tax = Math.round((subtotal - discount) * TAX_RATE);
  const total = Math.round(subtotal - discount + deliveryFee + tax);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        coupon,
        applyCoupon,
        removeCoupon,
        subtotal,
        discount,
        deliveryFee,
        tax,
        total,
        itemCount,
        getUnitPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
