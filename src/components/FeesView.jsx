import { useState, useEffect } from "react";
import {
  HiOutlineCash,
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineCreditCard,
  HiOutlineFilter,
  HiOutlineX,
  HiOutlinePrinter
} from "react-icons/hi";
import { fetchPaymentsApi, recordPaymentApi } from "../utils/api.js";
import CustomDropdown from "./CustomDropdown.jsx";

export default function FeesView({
  students = [],
  stats = {},
  onRefresh,
  onSelectStudent
}) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [paymentModeFilter, setPaymentModeFilter] = useState("All");

  // Record Payment Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("UPI");
  const [transactionId, setTransactionId] = useState("");
  const [notes, setNotes] = useState("");
  const [receivedBy, setReceivedBy] = useState("Accounts Team");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successReceipt, setSuccessReceipt] = useState(null);

  // Load Payments
  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await fetchPaymentsApi({
        search: search.trim() || undefined,
        paymentMode: paymentModeFilter !== "All" ? paymentModeFilter : undefined
      });
      if (res?.success) {
        setPayments(res.payments || []);
      }
    } catch (err) {
      console.error("Error loading payments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [paymentModeFilter]);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    loadPayments();
  };

  const openPaymentModal = (studentId = "") => {
    setSelectedStudentId(studentId || students[0]?._id || "");
    setAmount("");
    setPaymentMode("UPI");
    setTransactionId("");
    setNotes("");
    setReceivedBy("Accounts Team");
    setError("");
    setSuccessReceipt(null);
    setIsModalOpen(true);
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) {
      setError("Please select a student.");
      return;
    }
    const payAmount = Number(amount);
    if (!payAmount || payAmount <= 0) {
      setError("Please enter a valid positive payment amount.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await recordPaymentApi({
        studentId: selectedStudentId,
        amount: payAmount,
        paymentMode,
        transactionId: transactionId.trim(),
        notes: notes.trim(),
        receivedBy: receivedBy.trim()
      });

      if (res?.success) {
        setSuccessReceipt(res.payment);
        if (onRefresh) onRefresh();
        loadPayments();
      }
    } catch (err) {
      setError(err.message || "Failed to record payment.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedStudent = students.find((s) => s._id === selectedStudentId);

  // High-level metrics
  const totalRevenue = stats?.feeStats?.totalProjected || 0;
  const totalCollected = stats?.feeStats?.totalCollected || 0;
  const totalPending = stats?.feeStats?.totalPending || 0;
  const collectionRatio = stats?.feeStats?.collectionRatio || 0;

  return (
    <div className="space-y-6">
      {/* Financial KPIs Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Projected */}
        <div className="p-4.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
            Total Projected Fees
          </span>
          <div className="text-xl font-extrabold text-slate-900 mt-1">
            ₹{Number(totalRevenue).toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Sum of all enrolled students fee</p>
        </div>

        {/* Total Collected */}
        <div className="p-4.5 bg-white rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-emerald-700 font-semibold text-xs uppercase tracking-wider">
              Total Fees Collected
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
              {collectionRatio}%
            </span>
          </div>
          <div className="text-xl font-extrabold text-emerald-800 mt-1">
            ₹{Number(totalCollected).toLocaleString("en-IN")}
          </div>
          {/* Progress bar */}
          <div className="w-full bg-emerald-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, collectionRatio)}%` }}
            />
          </div>
        </div>

        {/* Pending Balance */}
        <div className="p-4.5 bg-white rounded-2xl border border-rose-200 bg-rose-50/20 shadow-2xs">
          <span className="text-rose-700 font-semibold text-xs uppercase tracking-wider">
            Outstanding Due
          </span>
          <div className="text-xl font-extrabold text-rose-800 mt-1">
            ₹{Number(totalPending).toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-rose-500 mt-1">Pending student installments</p>
        </div>

        {/* Record Action */}
        <div className="p-4.5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-blue-400 font-semibold text-xs uppercase tracking-wider">
              Accounts Desk
            </span>
            <div className="text-sm font-bold text-white mt-1">Record Fee Installment</div>
          </div>
          <button
            onClick={() => openPaymentModal()}
            className="w-full mt-2 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <HiOutlinePlus className="w-4 h-4" />
            + Record Payment
          </button>
        </div>
      </div>

      {/* Receipts Table & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 bg-slate-50/80 border-b border-slate-200/70 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <HiOutlineDocumentText className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-slate-800 text-sm">Official Fee Receipts Ledger</span>
            <span className="text-xs bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-lg">
              {payments.length} Receipts
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative min-w-[220px]">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <HiOutlineSearch className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search receipt #, student, ref..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </form>

            {/* Payment Mode Filter */}
            <div className="w-36">
              <CustomDropdown
                value={paymentModeFilter}
                onChange={(val) => setPaymentModeFilter(val)}
                options={[
                  { value: "All", label: "All Modes" },
                  { value: "UPI", label: "UPI" },
                  { value: "Bank Transfer", label: "Bank Transfer" },
                  { value: "Cash", label: "Cash" },
                  { value: "Card", label: "Card" }
                ]}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Receipt No</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Mode</th>
                <th className="py-3 px-4">Ref / Transaction</th>
                <th className="py-3 px-4">Payment Date</th>
                <th className="py-3 px-4">Received By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    Loading fee receipts...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No payment receipts found. Record an installment to generate a receipt.
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const student = p.student;
                  const dateStr = p.paymentDate
                    ? new Date(p.paymentDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })
                    : "—";

                  return (
                    <tr key={p._id} className="hover:bg-slate-50/70 transition">
                      {/* Receipt No */}
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                        {p.receiptNo}
                      </td>

                      {/* Student */}
                      <td className="py-3.5 px-4">
                        {student ? (
                          <div
                            onClick={() => onSelectStudent && onSelectStudent(student)}
                            className="cursor-pointer hover:text-blue-600 transition"
                          >
                            <span className="font-bold text-slate-900 block">{student.name}</span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {student.studentId}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Student Deleted</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-extrabold text-emerald-700">
                        ₹{Number(p.amount).toLocaleString("en-IN")}
                      </td>

                      {/* Mode */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          {p.paymentMode}
                        </span>
                      </td>

                      {/* Transaction Ref */}
                      <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                        {p.transactionId || "—"}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-600">{dateStr}</td>

                      {/* Received By */}
                      <td className="py-3.5 px-4 text-slate-500">{p.receivedBy || "Admin"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4.5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Record Fee Installment</h3>
                <p className="text-xs text-slate-300">Generate an official receipt and update student ledger</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>

            {successReceipt ? (
              <div className="p-6 text-center space-y-4 text-xs">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <HiOutlineCheckCircle className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Payment Recorded Successfully!</h4>
                  <p className="text-slate-500 mt-1">Official receipt has been generated and student ledger updated.</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 font-mono text-left space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Receipt No:</span>
                    <span className="font-bold text-blue-600">{successReceipt.receiptNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Amount Paid:</span>
                    <span className="font-bold text-emerald-700">₹{Number(successReceipt.amount).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mode:</span>
                    <span>{successReceipt.paymentMode}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleRecordPayment} className="p-6 overflow-y-auto space-y-4 text-xs">
                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-medium">
                    {error}
                  </div>
                )}

                {/* Student Selector */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Select Enrolled Student <span className="text-rose-500">*</span>
                  </label>
                  <CustomDropdown
                    value={selectedStudentId}
                    onChange={(val) => setSelectedStudentId(val)}
                    options={students.map((s) => ({
                      value: s._id,
                      label: `${s.name} (${s.studentId}) — Due: ₹${(s.feeDetails?.balance || 0).toLocaleString("en-IN")}`
                    }))}
                  />
                </div>

                {/* Selected Student Ledger Preview */}
                {selectedStudent && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/90 flex items-center justify-between text-[11px]">
                    <div>
                      <span className="text-slate-500">Final Fee:</span>{" "}
                      <span className="font-bold text-slate-800">
                        ₹{(selectedStudent.feeDetails?.finalFee || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Already Paid:</span>{" "}
                      <span className="font-bold text-emerald-700">
                        ₹{(selectedStudent.feeDetails?.paidAmount || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Remaining Balance:</span>{" "}
                      <span className="font-extrabold text-rose-700">
                        ₹{(selectedStudent.feeDetails?.balance || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Installment Amount (₹) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="e.g. 15000"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Payment Mode</label>
                    <CustomDropdown
                      value={paymentMode}
                      onChange={(val) => setPaymentMode(val)}
                      options={[
                        { value: "UPI", label: "UPI (GPay / PhonePe / Paytm)" },
                        { value: "Bank Transfer", label: "Bank Transfer (NEFT/IMPS)" },
                        { value: "Cash", label: "Cash Receipt" },
                        { value: "Card", label: "Debit / Credit Card" },
                        { value: "Cheque", label: "Cheque" }
                      ]}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Transaction Ref / UTR</label>
                    <input
                      type="text"
                      placeholder="e.g. UPI-2026100912"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Received By</label>
                    <input
                      type="text"
                      placeholder="Staff / Accounts"
                      value={receivedBy}
                      onChange={(e) => setReceivedBy(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Payment Notes (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Second installment paid via PhonePe"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold cursor-pointer"
                  >
                    {submitting ? "Recording..." : "Record & Generate Receipt"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
