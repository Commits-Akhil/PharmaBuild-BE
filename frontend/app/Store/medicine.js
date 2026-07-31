import { create } from "zustand";
import api from "../lib/api";

const useMedicineStore = create((set) => ({
  medicines: [],
  loading: false,
  error: null,

  fetchMedicines: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get("/medicines");
      // Backend returns { success: true, data: { medicines: [...] } }
      const medicines = response.data?.data?.medicines ?? [];
      set({ medicines, loading: false });
    } catch (err) {
      const msg =
        err.response?.data?.message || "Failed to fetch medicines.";
      set({ error: msg, loading: false });
    }
  },
}));

export default useMedicineStore;