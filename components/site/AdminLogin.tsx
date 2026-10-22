"use client";
import { useEffect, useState, type FormEvent } from "react";
export function AdminLogin({ reset = false }: { reset?: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (reset) {
      const hash = new URLSearchParams(location.hash.slice(1));
      setToken(hash.get("access_token") || "");
      if (hash.has("error_description")) setMessage(hash.get("error_description") || "Reset link expired.");
      history.replaceState(null, "", location.pathname);
    } else {
      fetch("/api/auth/refresh", { method: "POST" }).then(r => { if (r.ok) location.reload(); }).catch(() => {});
    }
  }, [reset]);
  async function submit(e: FormEvent) { e.preventDefault(); await send(reset ? "password" : "login"); }
  async function send(action: string) {
    setBusy(true); setMessage("");
    try {
      const response = await fetch(`/api/auth/${action}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, token }) });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error);
      if (action === "login") location.assign("/admin");
      else if (action === "recover") setMessage("If the account exists, a password reset email will arrive shortly.");
      else { setDone(true); setPassword(""); setToken(""); setMessage("Password updated. Sign in with your new password."); }
    } catch (error) { setMessage(error instanceof Error ? error.message : "Please try again."); }
    finally { setBusy(false); }
  }
  return <main className="at-admin mq-login"><section className="mq-login-card">
    <a href="/" className="at-kicker">MY QURAN · AT-TAHAJJI</a>
    <h1>{reset ? "Set a new password" : "Admin sign in"}</h1>
    <p>{reset ? "Choose a password with at least 12 characters." : "Use your authorised Supabase account to manage your website."}</p>
    {!done && <form onSubmit={submit}>
      {!reset && <label>Email address<input type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} /></label>}
      <label>{reset ? "New password" : "Password"}<input type="password" autoComplete={reset ? "new-password" : "current-password"} required minLength={reset ? 12 : 1} value={password} onChange={e => setPassword(e.target.value)} /></label>
      <button className="at-button" disabled={busy || (reset && !token)}>{busy ? "Please wait…" : reset ? "Update password" : "Sign in"}</button>
      {!reset && <button className="mq-reset" type="button" disabled={busy || !email} onClick={() => send("recover")}>Forgot password?</button>}
      {reset && !token && <p>Open this page using the link in your password reset email.</p>}
    </form>}
    {message && <p role="status" className="mq-login-message">{message}</p>}
    <a href={reset ? "/admin" : "/"}>{reset ? "Back to sign in" : "Back to website"}</a>
  </section></main>;
}
export function AdminSession() {
  useEffect(() => {
    let pending = false;
    const refresh = async () => {
      if (pending) return;
      pending = true;
      try { const r = await fetch("/api/auth/refresh", { method: "POST" }); if (r.status === 401 || r.status === 403) window.dispatchEvent(new Event("mq-session-expired")); }
      catch { /* Keep unsaved edits intact on temporary connection failure. */ }
      finally { pending = false; }
    };
    const timer = setInterval(refresh, 5 * 60 * 1000);
    window.addEventListener("focus", refresh);
    return () => { clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, []);
  const [expired, setExpired] = useState(false);
  useEffect(() => { const handler = () => setExpired(true); window.addEventListener("mq-session-expired", handler); return () => window.removeEventListener("mq-session-expired", handler); }, []);
  return expired ? <p role="alert" className="ad-alert">Your session expired. Keep this tab open to preserve your edits and <a href="/admin" target="_blank" rel="noreferrer">sign in in a new tab</a>, then try saving again.</p> : null;
}
