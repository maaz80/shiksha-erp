import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { HiOutlineLockClosed, HiOutlineUser, HiOutlineShieldCheck, HiOutlineSparkles } from "react-icons/hi";
import { loginApi } from "../utils/api.js";
import { setToken, setUser, isAuthenticated } from "../utils/auth.js";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("ShikshaERP");
  const [password, setPassword] = useState("ShikshaERP@123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if session expired
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("expired")) {
      setError("Session expired or unauthorized. Please sign in again.");
    }
    if (isAuthenticated()) {
      navigate("/", { replace: true });
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginApi(username.trim(), password.trim());
      if (res?.success && res?.token) {
        setToken(res.token);
        setUser(res.user);
        navigate("/", { replace: true });
      } else {
        throw new Error(res?.error || "Invalid ERP credentials");
      }
    } catch (err) {
      setError(err.message || "Invalid credentials. Please verify your username and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Decorative Gradient Blobs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-800 overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Top Header Card */}
        <div className="p-8 pb-6 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 text-center">
          <div className="inline-flex p-3 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 mb-4">
            <span className="font-extrabold text-2xl tracking-tighter">S</span>
          </div>

          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Shiksha <span className="text-blue-600">ERP System</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Student Management, Cohort Batches &amp; Fee Ledger
          </p>

          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-100">
            <HiOutlineShieldCheck className="w-4 h-4" />
            ERP Administrator &amp; Staff Access
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              ERP Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <HiOutlineUser className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. ShikshaERP"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Secure Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <HiOutlineLockClosed className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Quick Credential Prefill Button for Demo/Testing */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                setUsername("ShikshaERP");
                setPassword("ShikshaERP@123");
              }}
              className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer flex items-center gap-1"
            >
              <HiOutlineSparkles className="w-3.5 h-3.5" />
              Prefill Default Admin Credentials
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/25 disabled:opacity-50 cursor-pointer transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Signing In...
              </span>
            ) : (
              "Sign In to ERP Portal"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400">
          Shiksha EdTech ERP • Integrated Student &amp; LMS Operations
        </div>
      </div>
    </div>
  );
}
