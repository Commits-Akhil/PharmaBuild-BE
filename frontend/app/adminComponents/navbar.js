export default function Navbar() {
  return (
    <nav className="bg-white shadow-md px-8 py-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold">PharmaBuild Admin</h1>

      <div className="flex items-center gap-8">
        <div className="flex gap-6 text-gray-600 font-medium">
          <a href="#dashboard" className="hover:text-blue-600">
            Dashboard
          </a>

          <a href="#branches" className="hover:text-blue-600">
            Branches
          </a>

          <a href="#orders" className="hover:text-blue-600">
            Orders
          </a>

          <a href="#users" className="hover:text-blue-600">
            Users
          </a>
        </div>

        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Logout
        </button>
      </div>
    </nav>
  );
}
