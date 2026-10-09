import { useState } from "react";
import {
  HiOutlineHome,
  HiOutlineAcademicCap,
  HiOutlineUserGroup,
  HiOutlineClipboardCheck,
  HiOutlineCurrencyRupee,
  HiOutlineBadgeCheck,
  HiOutlinePlus,
  HiOutlineRefresh,
  HiOutlineLogout,
  HiMenu,
  HiX
} from "react-icons/hi";
import { getUser, clearAuth } from "../utils/auth.js";

const NAV_ITEMS = [
  { key: "overview", label: "Overview & Health", icon: HiOutlineHome },
  { key: "students", label: "Students Directory", icon: HiOutlineAcademicCap },
  { key: "batches", label: "Batches & Cohorts", icon: HiOutlineUserGroup },
  { key: "attendance", label: "Attendance Register", icon: HiOutlineClipboardCheck },
  { key: "fees", label: "Fees & Ledger", icon: HiOutlineCurrencyRupee },
  { key: "certificates", label: "Certificates (A4)", icon: HiOutlineBadgeCheck }
];

export default function ErpLayout({
  activeTab = "overview",
  onTabChange,
  onOpenAddStudent,
  onSyncCrm,
  syncing = false,
  children
}) {
  const user = getUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to sign out from Shiksha ERP?")) {
      clearAuth();
      window.location.href = "/login";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-2xs">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden cursor-pointer"
            >
              {mobileMenuOpen ? <HiX className="w-5 h-5" /> : <HiMenu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-lg shadow-sm shadow-blue-500/20">
                S
              </div>
              <div className="hidden sm:block">
                <span className="text-slate-900 font-extrabold text-base tracking-tight leading-none block">
                  Shiksha<span className="text-blue-600 font-bold ml-1">ERP</span>
                </span>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase block">
                  Academic Operations Desk
                </span>
              </div>
            </div>
          </div>

          {/* Quick External Portal Links */}
          <div className="hidden md:flex items-center gap-2 text-xs">
            <a
              href="http://localhost:5174"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 transition"
            >
              <span>CRM Portal</span>
              <span className="text-[10px] text-slate-400">↗</span>
            </a>
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 transition"
            >
              <span>CMS Admin</span>
              <span className="text-[10px] text-slate-400">↗</span>
            </a>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Sync from CRM Button */}
            <button
              type="button"
              onClick={onSyncCrm}
              disabled={syncing}
              title="Import newly enrolled students from CRM"
              className="px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <HiOutlineRefresh className={`w-4 h-4 text-emerald-600 ${syncing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{syncing ? "Syncing..." : "Sync CRM"}</span>
            </button>

            {/* Enroll Student Button */}
            <button
              type="button"
              onClick={onOpenAddStudent}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <HiOutlinePlus className="w-4 h-4" />
              <span className="hidden sm:inline">Enroll Student</span>
            </button>

            <div className="h-6 w-px bg-slate-200 hidden sm:block mx-1" />

            {/* User Profile & Sign Out */}
            <div className="flex items-center gap-2">
              <div className="text-right hidden xl:block">
                <span className="text-xs font-bold text-slate-900 block leading-tight">
                  {user?.name || "ERP Manager"}
                </span>
                <span className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider block">
                  Operations Admin
                </span>
              </div>

              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              >
                <HiOutlineLogout className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container with Sidebar & Content */}
      <div className="flex-1 flex">
        {/* Sidebar Navigation */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 flex flex-col justify-between pt-20 pb-6 px-4 transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-[calc(100vh-64px)] lg:pt-5 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="space-y-1">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Operations Hub
            </div>

            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;

              return (
                <button
                  key={item.key}
                  onClick={() => {
                    onTabChange(item.key);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? "bg-blue-50 text-blue-700 shadow-2xs font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? "text-blue-600" : "text-slate-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sidebar Status Footer */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between text-slate-500">
              <span>ERP Bridge</span>
              <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Active Sync
              </span>
            </div>
            <div className="text-slate-400 text-[10px]">
              Shiksha Operations v2.0
            </div>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-20 bg-slate-900/40 backdrop-blur-2xs lg:hidden"
          />
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
