"use client";

import { useRouter } from "next/navigation";
import { Button } from "@radix-ui/themes";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Server se cookie clear karo
      await fetch('/api/auth/logout', {
        method: 'POST',
      });

      // LocalStorage bhi clear karo
      localStorage.removeItem("token");

      // Force redirect
      window.location.href = "/login";

    } catch (err) {
      console.error(err);
      // Fallback
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  };

  return (
    <Button
      onClick={handleLogout}
      size="3"
      radius="full"
      className="group cursor-pointer overflow-hidden rounded-3xl border border-red-200 bg-gradient-to-r from-red-500 to-rose-500 px-5 py-3 font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl"
    >
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center rounded-full bg-white/20 p-1 transition-all duration-300 group-hover:rotate-12">
          <LogOut size={16} />
        </div>
        <span className="tracking-wide">Logout</span>
      </div>
    </Button>
  );
}