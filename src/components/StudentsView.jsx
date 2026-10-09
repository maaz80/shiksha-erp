import { useState } from "react";
import {
  HiOutlineSearch,
  HiOutlinePhone,
  HiOutlineEye,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineFilter,
  HiOutlineClipboardCheck
} from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import CustomDropdown from "./CustomDropdown.jsx";

const STATUS_BADGES = {
  Active: "bg-emerald-50 text-emerald-800 border-emerald-200",
  Completed: "bg-blue-50 text-blue-800 border-blue-200",
  "On-Hold": "bg-amber-50 text-amber-800 border-amber-200",
  Dropped: "bg-rose-50 text-rose-800 border-rose-200"
};

const FEE_BADGES = {
  Paid: "bg-emerald-100 text-emerald-800",
  Partial: "bg-amber-100 text-amber-800",
  Pending: "bg-rose-100 text-rose-800"
};

export const cleanDigits = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : digits;
};

export default function StudentsView({
  students = [],
  batches = [],
  pagination = { page: 1, limit: 50, total: 0, pages: 1 },
  onPageChange,
  searchQuery = "",
  onSearchChange,
  batchFilter = "All",
  onBatchFilterChange,
  statusFilter = "All",
  onStatusFilterChange,
  feeStatusFilter = "All",
  onFeeStatusFilterChange,
  onSelectStudent
}) {
  return (
    <div className="space-y-4">
      {/* Filter Toolbar */}
      <div className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
            <HiOutlineSearch className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by student ID, name, mobile, email, or roll no..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Batch Filter */}
          <div className="w-44">
            <CustomDropdown
              size="sm"
              value={batchFilter}
              onChange={(val) => onBatchFilterChange(val)}
              options={[
                { value: "All", label: "All Batches" },
                ...batches.map((b) => ({
                  value: b._id,
                  label: `${b.name} (${b.batchCode})`
                }))
              ]}
              searchable={true}
              searchPlaceholder="Filter batch..."
            />
          </div>

          {/* Academic Status */}
          <div className="w-36">
            <CustomDropdown
              size="sm"
              value={statusFilter}
              onChange={(val) => onStatusFilterChange(val)}
              options={[
                { value: "All", label: "All Statuses" },
                { value: "Active", label: "Active" },
                { value: "Completed", label: "Completed" },
                { value: "On-Hold", label: "On-Hold" },
                { value: "Dropped", label: "Dropped" }
              ]}
            />
          </div>

          {/* Fee Status */}
          <div className="w-38">
            <CustomDropdown
              size="sm"
              value={feeStatusFilter}
              onChange={(val) => onFeeStatusFilterChange(val)}
              options={[
                { value: "All", label: "All Fee Status" },
                { value: "Paid", label: "Fully Paid" },
                { value: "Partial", label: "Partial Dues" },
                { value: "Pending", label: "Unpaid (Pending)" }
              ]}
            />
          </div>
        </div>
      </div>

      {/* Students Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-5">Student Profile</th>
                <th className="py-3 px-5">Program & Batch</th>
                <th className="py-3 px-5">Attendance</th>
                <th className="py-3 px-5">Fee Ledger</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-slate-400 italic">
                    No student records found matching the active filters
                  </td>
                </tr>
              ) : (
                students.map((st) => {
                  const phone = cleanDigits(st.phone);
                  const att = st.attendanceStats?.percentage || 0;
                  const attColor =
                    att >= 75
                      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                      : att >= 50
                      ? "text-amber-700 bg-amber-50 border-amber-200"
                      : "text-rose-700 bg-rose-50 border-rose-200";

                  const feeStatus = st.feeDetails?.paymentStatus || "Pending";
                  const paid = Number(st.feeDetails?.paidAmount) || 0;
                  const finalAmt = Number(st.feeDetails?.finalFee) || 0;
                  const bal = Number(st.feeDetails?.balance) || 0;
                  const feePct = finalAmt > 0 ? Math.min(100, Math.round((paid / finalAmt) * 100)) : 0;

                  return (
                    <tr
                      key={st._id}
                      onClick={() => onSelectStudent(st)}
                      className="hover:bg-blue-50/30 transition cursor-pointer group"
                    >
                      {/* Student Profile */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-100/70 text-blue-700 font-bold flex items-center justify-center shrink-0 text-sm">
                            {(st.name || "S")[0].toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 group-hover:text-blue-600 transition block leading-tight">
                              {st.name}
                            </span>
                            <span className="text-[11px] text-blue-600 font-semibold block">
                              {st.studentId}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate max-w-[180px]">
                              {st.email || "No email"} • {phone ? `+91 ${phone}` : "No mobile"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Course & Batch */}
                      <td className="py-3.5 px-5">
                        <span className="font-semibold text-slate-800 block line-clamp-1">
                          {st.course}
                        </span>
                        {st.batch ? (
                          <span className="text-[11px] text-slate-500 block">
                            {st.batch.name} ({st.batch.batchCode})
                          </span>
                        ) : (
                          <span className="text-[11px] text-amber-600 font-medium italic block">
                            No batch assigned
                          </span>
                        )}
                      </td>

                      {/* Attendance */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${attColor}`}
                          >
                            {att}% Attended
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {st.attendanceStats?.attendedSessions || 0} /{" "}
                          {st.attendanceStats?.totalSessions || 0} Sessions
                        </span>
                      </td>

                      {/* Fee Ledger */}
                      <td className="py-3.5 px-5">
                        <div className="space-y-1 max-w-[140px]">
                          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-600">
                            <span>₹{paid.toLocaleString("en-IN")}</span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold ${
                                FEE_BADGES[feeStatus]
                              }`}
                            >
                              {feeStatus}
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-blue-600 transition-all duration-300"
                              style={{ width: `${feePct}%` }}
                            />
                          </div>
                          {bal > 0 ? (
                            <span className="text-[10px] text-rose-600 font-bold block">
                              Due: ₹{bal.toLocaleString("en-IN")}
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-600 font-bold block">
                              Clear Balance
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Academic Status */}
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            STATUS_BADGES[st.status] || STATUS_BADGES.Active
                          }`}
                        >
                          {st.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {phone && (
                            <a
                              href={`tel:${phone}`}
                              title="Call Student"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                            >
                              <HiOutlinePhone className="w-4 h-4" />
                            </a>
                          )}
                          {phone && (
                            <a
                              href={`https://wa.me/91${phone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Chat on WhatsApp"
                              className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition"
                            >
                              <FaWhatsapp className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => onSelectStudent(st)}
                            title="Open Student Profile Drawer"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                          >
                            <HiOutlineEye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pagination.pages > 1 && (
          <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page <span className="font-bold text-slate-800">{pagination.page}</span> of{" "}
              <span className="font-bold text-slate-800">{pagination.pages}</span> (
              {pagination.total} students)
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                <HiOutlineChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                <HiOutlineChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
