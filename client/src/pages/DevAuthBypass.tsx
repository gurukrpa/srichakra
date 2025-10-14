import React, { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ensureDevUser } from "@/lib/auth";

const DevAuthBypass: React.FC = () => {
  const [, navigate] = useLocation();

  useEffect(() => {
    ensureDevUser();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#83C5BE] p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold mb-2">Authentication Disabled</h1>
        <p className="text-gray-600 mb-6">
          Login and signup are temporarily disabled in development. You're using a
          mock developer session.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 rounded bg-[#006D77] text-white hover:opacity-90"
          >
            Go to Home
          </button>
          <Link href="/admin/dashboard" className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50">
            Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DevAuthBypass;
