import { MdOutlineEmail } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { RiFacebookBoxLine } from "react-icons/ri";
import { FaInstagram } from "react-icons/fa";
import { RiTwitterXFill } from "react-icons/ri";
import { AiOutlineLinkedin } from "react-icons/ai";

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
        <div>
          <h2 className="text-2xl font-extrabold text-green-500 flex flex-row items-center">
            <span className="text-2xl font-extrabold text-black">RX</span>
            <span>Connect</span>
          </h2>
          <p className="text-gray-600 mt-3 text-sm leading-relaxed">
            A modern multi-branch pharmacy platform delivering medicines safely and quickly.
          </p>
          <div className="text-gray-600 flex items-center gap-4 mt-4 text-xl">
            <RiFacebookBoxLine className="hover:text-green-600 cursor-pointer transition" />
            <FaInstagram className="hover:text-green-600 cursor-pointer transition" />
            <RiTwitterXFill className="hover:text-green-600 cursor-pointer transition" />
            <AiOutlineLinkedin className="hover:text-green-600 cursor-pointer transition" />
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-4 text-black text-sm uppercase tracking-wider">
            Company
          </h3>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li>About Us</li>
            <li>Branches</li>
            <li>Contact</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-4 text-black text-sm uppercase tracking-wider">
            Shop
          </h3>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li>Medicines</li>
            <li>Upload Prescription</li>
            <li>Orders</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-4 text-black text-sm uppercase tracking-wider">
            Account
          </h3>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li>Login</li>
            <li>Register</li>
            <li>Dashboard</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-4 text-black text-sm uppercase tracking-wider">
            Contact
          </h3>
          <div className="space-y-2 text-sm">
            <p className="text-gray-600 flex items-center gap-2">
              <MdOutlineEmail className="text-green-600 shrink-0" />
              care@rxconnect.in
            </p>
            <p className="text-gray-600 flex items-center gap-2">
              <FaPhoneAlt className="text-green-600 shrink-0" />
              1800-200-1001
            </p>
            <p className="text-gray-600 flex items-center gap-2">
              <IoLocationOutline className="text-green-600 shrink-0" />
              Bengaluru, India
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 py-5 text-center text-gray-500 text-xs sm:text-sm">
        © 2026 RxConnect. All Rights Reserved.
      </div>
    </footer>
  );
}