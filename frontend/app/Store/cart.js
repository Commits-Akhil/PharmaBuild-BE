import { create } from "zustand";

const useCartStore = create((set) => ({
  cart: [],

  addToCart: (medicine) =>
    set((state) => {
      const existing = state.cart.find(
        (item) => item.medicineId === medicine.id
      );
      if (existing) {
        return {
          cart: state.cart.map((item) =>
            item.medicineId === medicine.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return {
        cart: [
          ...state.cart,
          {
            medicineId: medicine.id,
            name: medicine.name,
            price: medicine.price,
            is_prescription_required: medicine.is_prescription_required,
            quantity: 1,
          },
        ],
      };
    }),

  removeFromCart: (medicineId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.medicineId !== medicineId),
    })),

  updateQuantity: (medicineId, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        return { cart: state.cart.filter((item) => item.medicineId !== medicineId) };
      }
      return {
        cart: state.cart.map((item) =>
          item.medicineId === medicineId ? { ...item, quantity } : item
        ),
      };
    }),

  clearCart: () => set({ cart: [] }),
}));

export default useCartStore;