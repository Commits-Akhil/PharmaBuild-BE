import Categories from "./components/Categories";
import PopularMedicines from "./components/PopularMedicines";

export default function Home() {
  return (
    <div className="bg-[#0A1020]">

      <Categories />

      <PopularMedicines />

    </div>
  );
}