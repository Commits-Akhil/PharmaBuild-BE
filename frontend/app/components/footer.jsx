import { MdOutlineEmail } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { RiFacebookBoxLine } from "react-icons/ri";
import { FaInstagram } from "react-icons/fa";
import { RiTwitterXFill } from "react-icons/ri";
import { AiOutlineLinkedin } from "react-icons/ai";


export default function Footer() {
  return (
    <footer className="bg-gray-100 ">

      <div className="max-w-7xl mx-auto px-8 py-12 grid md:grid-cols-5 gap-8">


        <div>

          <h2 className="text-2xl font-extrabold text-green-500 flex flex-row">
            <p className="text-2xl font-extrabold text-black">RX</p><p>Connect</p>
          </h2>

          <p className="text-gray-600 mt-3">
            A modern multi-branch pharmacy platform delivering medicines safely and quickly.
          </p>
          <p className="text-gray-600 flex items-center justify-around mr-5">
            <RiFacebookBoxLine />
            <FaInstagram />
            <RiTwitterXFill />
            <AiOutlineLinkedin />


          </p>

        </div>

        

        <div>

          <h3 className="font-medium mb-4 text-black">
            Company
          </h3>

          <ul className="space-y-2 text-gray-600">

            <li>About Us</li>

            <li>Branches</li>

            <li>Contact</li>

          </ul>

        </div>


        <div>

          <h3 className="font-medium mb-4 text-black">
            Shop
          </h3>

          <ul className="space-y-2 text-gray-600">

            <li>Medicines</li>

            <li>Upload Prescription</li>

            <li>Orders</li>

          </ul>

        </div>


        <div>
            <h3 className="font-medium mb-4 text-black">
            Account
          </h3>

          <ul className="space-y-2 text-gray-600">

            <li>Login</li>

            <li>Register</li>

            <li>Dashboard</li>

          </ul>

        </div>
        

        <div >

          <h3 className="font-medium mb-4 text-black">
            Contact
          </h3>

          <p className="text-gray-600 flex items-center gap-2">
            <MdOutlineEmail  />
             care@rxconnect.in
          </p>

          <p className="text-gray-600 flex items-center gap-2">
            <FaPhoneAlt />

             1800-200-1001
          </p>

          <p className="text-gray-600 flex items-center gap-2">
            <IoLocationOutline />

             Bengaluru, India
          </p>

        </div>

      </div>

      <div className="border-t py-5 text-center text-gray-500">

        © 2026 RxConnect. All Rights Reserved.

      </div>

    </footer>
  );
}