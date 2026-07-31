import useCartStore from "../store/useCartStore";

function MedicineCard({ medicine }) {

  const cart = useCartStore((state) => state.cart);

  const addToCart = useCartStore(
    (state) => state.addToCart
  );

  const item = cart.find(
    (i) => i.medicineId === medicine.id
  );

  const quantity = item ? item.quantity : 0;

  return (
    <div>

      <h2>{medicine.name}</h2>

      <button
        onClick={() => addToCart(medicine.id)}
      >
        +
      </button>

      <span>{quantity}</span>

    </div>
  );
}

export default MedicineCard;