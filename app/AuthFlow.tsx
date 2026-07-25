"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";

type AuthFlowProps = {
  onDone?: (role?: "buyer" | "seller" | "guest") => void;
};

export default function AuthFlow({ onDone }: AuthFlowProps) {
  const router = useRouter();
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setError(null);
    setName("");
    setEmail("");
    setPassword("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!email.trim() || !password.trim()) {
        setError("Please enter your email and password.");
        return;
      }

      if (mode === "signup" && !name.trim()) {
        setError("Please enter your full name.");
        return;
      }

      const result =
        mode === "login"
          ? await login(email.trim(), password)
          : await signup({ name: name.trim(), email: email.trim(), password });

      if (!result.success) {
        setError(result.message || "Something went wrong. Please try again.");
        return;
      }

      try {
        sessionStorage.setItem("unimart:justLoggedIn", "1");
      } catch {
        // ignore
      }
      window.dispatchEvent(new Event("unimart:authChanged"));

      if (onDone) {
        onDone(result.user?.role || "buyer");
      } else {
        router.replace("/");
      }
      resetForm();
    } catch (err: any) {
      setError(err?.message || "Unable to complete authentication. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-[32px] border border-slate-200 bg-white shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 px-8 py-8 text-white">
          <h1 className="text-3xl font-black tracking-tight">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-3 text-sm text-orange-100 leading-6">
            {mode === "login"
              ? "Sign in to start messaging sellers, unlocking deals, and exploring campus shopping."
              : "Join Uni-Mart now and unlock your verified account, profile badges, and exclusive gifts."}
          </p>
        </div>

        <div className="px-8 py-6">
          <div className="mb-6 flex overflow-hidden rounded-3xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => { setMode("login"); setError(null); }}
              className={`flex-1 rounded-3xl py-3 text-sm font-semibold transition ${
                mode === "login"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => { setMode("signup"); setError(null); }}
              className={`flex-1 rounded-3xl py-3 text-sm font-semibold transition ${
                mode === "signup"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <label className="block text-sm font-medium text-slate-700">
                Full name
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  placeholder="Jane Doe"
                  autoComplete="name"
                />
              </label>
            )}

            <label className="block text-sm font-medium text-slate-700">
              Email address
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                placeholder="Create a password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </label>

            {error && (
              <div className="rounded-3xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-3xl bg-orange-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "One moment..." : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            {mode === "login"
              ? "New to Uni-Mart? "
              : "Already have an account? "}
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="font-semibold text-orange-600 hover:text-orange-700"
            >
              {mode === "login" ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
