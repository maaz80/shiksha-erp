import { useState } from "react";
import { HiOutlineX, HiOutlineUserAdd, HiOutlineCash, HiOutlineAcademicCap } from "react-icons/hi";
import CustomDropdown from "./CustomDropdown.jsx";

const DEFAULT_COURSES = [
  "UI/UX Design Masterclass",
  "Full Stack Web Development",
  "React & Next.js Advanced",
  "Python & AI Engineering",
  "Graphic Design Pro",
  "Digital Marketing Executive"
];

export default function AddStudentModal({ isOpen, onClose, batches = [], academyCourses = [], onStudentCreated }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [course, setCourse] = useState(DEFAULT_COURSES[0]);
  const [batchId, setBatchId] = useState("");
  const [status, setStatus] = useState("Active");
  const [address, setAddress] = useState("");
  const [education, setEducation] = useState("");

  // Fee Details
  const [totalFee, setTotalFee] = useState(45000);
  const [discount, setDiscount] = useState(0);
  const [initialPayment, setInitialPayment] = useState(0);
  const [paymentMode, setPaymentMode] = useState("UPI");
  const [transactionId, setTransactionId] = useState("");

  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyRelation, setEmergencyRelation] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const finalFee = Math.max(0, Number(totalFee) - Number(discount));
  const remainingBalance = Math.max(0, finalFee - Number(initialPayment));

  // Merge default courses with catalog courses if available
  const availableCourses = Array.from(
    new Set([
      ...DEFAULT_COURSES,
      ...(academyCourses || []).map((c) => c.title).filter(Boolean)
    ])
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Student full name is required.");
      return;
    }
    if (!phone.trim()) {
      setError("Primary mobile phone is required.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        course,
        batch: batchId || null,
        status,
        address: address.trim(),
        education: education.trim(),
        totalFee: Number(totalFee) || 0,
        discount: Number(discount) || 0,
        initialPayment: Number(initialPayment) || 0,
        paymentMode,
        transactionId: transactionId.trim(),
        emergencyContact: {
          name: emergencyName.trim(),
          phone: emergencyPhone.trim(),
          relation: emergencyRelation.trim()
        }
      };

      await onStudentCreated(payload);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create student admission.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <HiOutlineUserAdd className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">New Student Admission</h2>
              <p className="text-xs text-slate-300">Enroll student directly into Shiksha ERP with automatic roll number</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-medium">
              {error}
            </div>
          )}

          {/* Personal Information */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <HiOutlineAcademicCap className="w-4 h-4 text-blue-600" />
              1. Student Details & Enrollment
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aryan Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. aryan@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Highest Education</label>
                <input
                  type="text"
                  placeholder="e.g. B.Tech CS / BCA / Graduate"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Enrolled Course</label>
                <CustomDropdown
                  value={course}
                  onChange={(val) => setCourse(val)}
                  options={availableCourses.map((c) => ({ value: c, label: c }))}
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Assign Live Batch (Optional)</label>
                <CustomDropdown
                  value={batchId}
                  onChange={(val) => setBatchId(val)}
                  options={[
                    { value: "", label: "Assign Later / No Batch" },
                    ...batches.map((b) => ({
                      value: b._id,
                      label: `${b.name} (${b.schedule || "Regular"})`
                    }))
                  ]}
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">City / Residential Address</label>
              <input
                type="text"
                placeholder="e.g. Sector 62, Noida, Uttar Pradesh"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Fee & Payment Ledger */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <HiOutlineCash className="w-4 h-4 text-emerald-600" />
              2. Fee Structure & Initial Installment
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Total Course Fee (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={totalFee}
                  onChange={(e) => setTotalFee(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Scholarship / Discount (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Initial Paid Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={initialPayment}
                  onChange={(e) => setInitialPayment(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Live Fee Computation Preview */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 font-medium">Final Course Fee:</span>{" "}
                <span className="font-bold text-slate-900">₹{finalFee.toLocaleString("en-IN")}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Paid:</span>{" "}
                <span className="font-bold text-emerald-700">₹{Number(initialPayment).toLocaleString("en-IN")}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Remaining Balance:</span>{" "}
                <span className="font-extrabold text-rose-700">₹{remainingBalance.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {Number(initialPayment) > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Payment Mode</label>
                  <CustomDropdown
                    value={paymentMode}
                    onChange={(val) => setPaymentMode(val)}
                    options={[
                      { value: "UPI", label: "UPI (Google Pay / PhonePe / Paytm)" },
                      { value: "Bank Transfer", label: "Bank Transfer (NEFT / IMPS)" },
                      { value: "Cash", label: "Cash Receipt" },
                      { value: "Card", label: "Credit / Debit Card" },
                      { value: "Cheque", label: "Cheque" }
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Transaction Ref / UTR</label>
                  <input
                    type="text"
                    placeholder="e.g. UPI-1234567890"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Emergency Contact */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              3. Emergency Guardian Contact (Optional)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Guardian Name</label>
                <input
                  type="text"
                  placeholder="Father / Mother Name"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">Guardian Phone</label>
                <input
                  type="tel"
                  placeholder="Mobile"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">Relationship</label>
                <input
                  type="text"
                  placeholder="Father, Mother, Brother"
                  value={emergencyRelation}
                  onChange={(e) => setEmergencyRelation(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-medium cursor-pointer transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold shadow-sm shadow-blue-500/20 cursor-pointer transition flex items-center gap-2"
            >
              {loading ? "Enrolling Student..." : "Confirm & Enroll Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
