// page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth";

export default function Home() {
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const identifier = form.get("identifier")?.trim();
    const password = form.get("password");

    if (!identifier || !password) {
      setErr("Please fill in both fields.");
      setLoading(false);
      return;
    }

    try {
      await signIn(identifier, password); // stores JWT internally (localStorage or cookie)
      router.push("/profile");            // show “You’re logged in” page
    } catch (e2) {
      setErr(e2.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
    {/* Background layers you already have */}
    <div className="grid-bg" />
    <div className="gradient-overlay" />
    <div className="scanlines" />

    {/* Floating shapes */}
    <div className="shapes-container">
      <div className="shape shape-circle" />
      <div className="shape shape-triangle" />
      <div className="shape shape-square" />
    </div>

      <div className="auth-wrap">
      <h1 className="section-title">Welcome to GraphQL</h1>
      <section className="login-card" role="dialog" aria-labelledby="login-title" aria-modal="true">
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="identifier" className="login-label">
            Username or Email
          </label>
          <input
            id="identifier"
            name="identifier"
            type="text"
            inputMode="email"
            autoComplete="username email"
            required
            className="login-input"
            placeholder="e.g. alomar or example@mail.com"
            disabled={loading}
          />

          <label htmlFor="password" className="login-label">
            Password
          </label>
          <div className="password-wrap">
            <input
              id="password"
              name="password"
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              required
              className="login-input"
              placeholder="••••••••"
              disabled={loading}
            />
            <button
              type="button"
              className="toggle-pw"
              aria-pressed={showPw}
              onClick={() => setShowPw(v => !v)}
              title={showPw ? "Hide password" : "Show password"}
              disabled={loading}
            >
              {showPw ? "Hide" : "Show"}
            </button>
          </div>

          {err && <p className="error-msg" role="alert">{err}</p>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </section>
      </div>
    </main>
  );
}