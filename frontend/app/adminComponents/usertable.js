"use client";

import { Users, Shield, UserCheck } from "lucide-react";

export default function UsersTable({ users, fetchFailed }) {
  if (fetchFailed || !Array.isArray(users)) {
    return (
      <div className="bg-[#161F33] rounded-[24px] sm:rounded-[28px] border border-red-500/30 p-5 sm:p-6 text-center text-red-400 text-xs sm:text-sm">
        Failed to load registered system users.
      </div>
    );
  }

  const sortedUsers = [...users].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  return (
    <div className="bg-[#161F33] rounded-[24px] sm:rounded-[28px] border border-white/10 p-4 sm:p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Users className="text-emerald-400 shrink-0" size={22} /> Registered Accounts
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Complete user management across Customers, Pharmacists, and Admins.
          </p>
        </div>
        <span className="bg-[#0D1527] text-emerald-400 text-xs px-3.5 py-1.5 rounded-full border border-white/5 font-mono shrink-0">
          Total: {users.length} Users
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm text-gray-300">
          <thead>
            <tr className="border-b border-white/10 text-gray-400 uppercase text-[10px] sm:text-xs tracking-wider">
              <th className="pb-3 px-3">Name</th>
              <th className="pb-3 px-3">Email</th>
              <th className="pb-3 px-3">Role</th>
              <th className="pb-3 px-3">Branch ID</th>
              <th className="pb-3 px-3">Joined Date</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500 text-xs sm:text-sm">
                  No accounts found.
                </td>
              </tr>
            ) : (
              sortedUsers.map((user) => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-[#1f2d47]/50 transition">
                  <td className="py-3 px-3 font-medium text-white flex items-center gap-2 whitespace-nowrap">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    {user.name}
                  </td>
                  <td className="py-3 px-3 text-gray-300 whitespace-nowrap">{user.email}</td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold capitalize ${
                        user.role === "admin"
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : user.role === "pharmacist"
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-gray-400 whitespace-nowrap">
                    {user.branch_id ? `#${user.branch_id}` : "Global"}
                  </td>
                  <td className="py-3 px-3 text-gray-400 text-xs whitespace-nowrap">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

