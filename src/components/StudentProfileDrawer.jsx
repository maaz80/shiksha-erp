import { useState, useEffect } from "react";
import {
  HiX,
  HiOutlineAcademicCap,
  HiOutlineUserGroup,
  HiOutlineCurrencyRupee,
  HiOutlineClipboardCheck,
  HiOutlineVideoCamera,
  HiOutlineChatAlt2,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineCheckCircle,
  HiOutlineLockClosed,
  HiOutlineLockOpen
} from "react-icons/hi";
import CustomDropdown from "./CustomDropdown.jsx";
import {
  fetchStudentByIdApi,
  updateStudentApi,
  deleteStudentApi,
  addStudentNoteApi,
  unlockCourseForStudentApi,
  revokeCourseForStudentApi,
  recordPaymentApi,
  fetchAcademyCoursesApi
} from "../utils/api.js";

const STATUS_OPTIONS = [
  { value: "Active", label: "Active Scholar" },
  { value: "Completed", label: "Completed (Graduated)" },
  { value: "On-Hold", label: "On-Hold (Temporary Pause)" },
  { value: "Dropped", label: "Dropped Out" }
];

export default function StudentProfileDrawer({
  isOpen,
  onClose,
  student,
  batches = [],
  academyCourses = [],
  onStudentUpdated
}) {
  const [studentProfile, setProfile] = useState(student);
  const [catalogCourses, setCatalogCourses] = useState(academyCourses || []);
  const [selectedCourseToUnlock, setSelectedCourseToUnlock] = useState("");
  const [unlocking, setUnlocking] = useState(false);

  // Record Payment Inline State
  const [payAmount, setPayAmount] = useState("");
  const [payMode, setPayMode] = useState("UPI");
  const [payTxnId, setPayTxnId] = useState("");
  const [recordingPay, setRecordingPay] = useState(false);

  // New Note State
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  // Refresh profile on open
  useEffect(() => {
    if (student?._id) {
      setProfile(student);
      fetchStudentByIdApi(student._id)
        .then((res) => {
          if (res?.success && res?.student) setProfile(res.student);
        })
        .catch(() => {});

      if (academyCourses && academyCourses.length > 0) {
        setCatalogCourses(academyCourses);
        setSelectedCourseToUnlock((prev) => prev || academyCourses[0]._id);
      } else {
        fetchAcademyCoursesApi()
          .then((res) => {
            if (res?.success && res?.courses) {
              setCatalogCourses(res.courses);
              if (res.courses.length > 0) setSelectedCourseToUnlock((prev) => prev || res.courses[0]._id);
            }
          })
          .catch(() => {});
      }
    } else {
      setProfile(null);
    }
  }, [student, academyCourses]);

  const activeStudent = studentProfile && studentProfile._id === student?._id ? studentProfile : student;
  const isDrawerOpen = isOpen !== undefined ? isOpen : Boolean(student);

  if (!isDrawerOpen || !activeStudent) return null;

  const profile = activeStudent;

  // 1. Batch Allocation Change
  const handleBatchChange = async (newBatchId) => {
    try {
      const res = await updateStudentApi(profile._id, { batchId: newBatchId || null });
      if (res?.success) {
        setProfile(res.student);
        if (onStudentUpdated) onStudentUpdated(res.student);
      }
    } catch (err) {
      alert("Failed to assign batch: " + err.message);
    }
  };

  // 2. Status Change
  const handleStatusChange = async (newStatus) => {
    try {
      const res = await updateStudentApi(profile._id, { status: newStatus });
      if (res?.success) {
        setProfile(res.student);
        if (onStudentUpdated) onStudentUpdated(res.student);
      }
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  // 3. Unlock LMS Video Course
  const handleUnlockCourse = async () => {
    if (!selectedCourseToUnlock) return;
    setUnlocking(true);
    try {
      const res = await unlockCourseForStudentApi(profile._id, selectedCourseToUnlock, "ERP Counselor");
      if (res?.success) {
        setProfile(res.student);
        alert(res.message || "Course unlocked on website LMS successfully!");
        if (onStudentUpdated) onStudentUpdated(res.student);
      }
    } catch (err) {
      alert("Failed to unlock course: " + err.message);
    } finally {
      setUnlocking(false);
    }
  };

  // 4. Revoke LMS Video Course
  const handleRevokeCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to revoke this LMS course access? The price will be deducted from the fee ledger.")) {
      return;
    }
    try {
      const res = await revokeCourseForStudentApi(profile._id, courseId, "ERP Counselor");
      if (res?.success) {
        setProfile(res.student);
        alert(res.message || "Course access revoked from LMS.");
        if (onStudentUpdated) onStudentUpdated(res.student);
      }
    } catch (err) {
      alert("Failed to revoke course: " + err.message);
    }
  };

  // 5. Record Fee Installment
  const handleRecordPayment = async (e) => {
    e.preventDefault();
    const amt = Number(payAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("Please enter a valid installment amount.");
      return;
    }
    setRecordingPay(true);
    try {
      const res = await recordPaymentApi({
        studentId: profile._id,
        amount: amt,
        paymentMode: payMode,
        transactionId: payTxnId.trim()
      });
      if (res?.success) {
        setProfile(res.student);
        setPayAmount("");
        setPayTxnId("");
        alert(res.message || "Fee payment recorded successfully!");
        // Refresh payments list
        const fresh = await fetchStudentByIdApi(profile._id);
        if (fresh?.success && fresh?.student) setProfile(fresh.student);
        if (onStudentUpdated) onStudentUpdated(res.student);
      }
    } catch (err) {
      alert("Failed to record payment: " + err.message);
    } finally {
      setRecordingPay(false);
    }
  };

  // 6. Add Counselor / Academic Note
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setAddingNote(true);
    try {
      const res = await addStudentNoteApi(profile._id, newNote.trim());
      if (res?.success) {
        setNewNote("");
        const fresh = await fetchStudentByIdApi(profile._id);
        if (fresh?.success && fresh?.student) setProfile(fresh.student);
      }
    } catch (err) {
      alert("Failed to add note: " + err.message);
    } finally {
      setAddingNote(false);
    }
  };

  // 7. Delete Student
  const handleDeleteStudent = async () => {
    if (window.confirm(`Are you sure you want to permanently delete student "${profile.name}" (${profile.studentId}) and all linked payment receipts?`)) {
      try {
        await deleteStudentApi(profile._id);
        if (onStudentUpdated) onStudentUpdated(null, true);
        onClose();
      } catch (err) {
        alert("Failed to delete student: " + err.message);
      }
    }
  };

  const att = profile.attendanceStats?.percentage || 0;
  const attColor =
    att >= 75
      ? "bg-emerald-500"
      : att >= 50
      ? "bg-amber-500"
      : "bg-rose-500";

  const fee = profile.feeDetails || {};
  const paid = Number(fee.paidAmount) || 0;
  const finalFee = Number(fee.finalFee) || 0;
  const balance = Number(fee.balance) || 0;
  const feePct = finalFee > 0 ? Math.min(100, Math.round((paid / finalFee) * 100)) : 0;

  // Batch options for dropdown
  const batchOptions = [
    { value: "", label: "No Batch Allocated (Unassigned)" },
    ...batches.map((b) => ({
      value: b._id,
      label: `${b.name} (${b.batchCode}) — ${b.schedule}`
    }))
  ];

  const currentBatchId = profile.batch?._id || profile.batch || "";

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-slide-in"
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-lg shadow-sm">
              {(profile.name || "S")[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-slate-900 leading-tight">
                  {profile.name}
                </h2>
                <span className="text-[11px] font-mono bg-blue-100 text-blue-800 font-extrabold px-2 py-0.5 rounded-md">
                  {profile.studentId}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {profile.course} • Enrolled {new Date(profile.enrollmentDate).toLocaleDateString("en-IN")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDeleteStudent}
              title="Delete Student Record"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            >
              <HiOutlineTrash className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition cursor-pointer"
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar text-xs">
          {/* Status & Batch Allocation Ribbon */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Academic Status */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Academic Status
                </label>
                <CustomDropdown
                  options={STATUS_OPTIONS}
                  value={profile.status}
                  onChange={handleStatusChange}
                />
              </div>

              {/* Batch Allocation */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Batch Cohort
                </label>
                <CustomDropdown
                  options={batchOptions}
                  value={currentBatchId}
                  onChange={handleBatchChange}
                  placeholder="Allocate batch..."
                />
              </div>
            </div>
          </div>

          {/* Class Attendance Tracker Card */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <HiOutlineClipboardCheck className="w-4 h-4 text-blue-600" />
                Live Class Attendance
              </span>
              <span
                className={`font-bold text-[11px] px-2.5 py-0.5 rounded-full ${
                  att >= 75
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : att >= 50
                    ? "bg-amber-50 text-amber-800 border border-amber-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {att}% Attendance Ratio
              </span>
            </div>

            <div className="space-y-1">
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${attColor}`}
                  style={{ width: `${Math.min(100, Math.max(att, 4))}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                <span>Present: {profile.attendanceStats?.attendedSessions || 0} Sessions</span>
                <span>Total Held: {profile.attendanceStats?.totalSessions || 0} Sessions</span>
              </div>
            </div>

            {/* Recent Attendance Log Snippet */}
            {profile.recentAttendance && profile.recentAttendance.length > 0 && (
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Recent Session Log
                </span>
                <div className="space-y-1">
                  {profile.recentAttendance.slice(0, 3).map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 text-[10px]"
                    >
                      <span className="font-medium text-slate-700">
                        {r.dateStr} — {r.topic}
                      </span>
                      <span
                        className={`font-bold px-1.5 py-0.2 rounded ${
                          r.status === "Present"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Fee Ledger & Payment Receipts */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <HiOutlineCurrencyRupee className="w-4 h-4 text-emerald-600" />
                Fee Ledger & Installments
              </span>
              <span
                className={`font-bold text-[10px] px-2 py-0.5 rounded-md ${
                  fee.paymentStatus === "Paid"
                    ? "bg-emerald-100 text-emerald-800"
                    : fee.paymentStatus === "Partial"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-rose-100 text-rose-800"
                }`}
              >
                {fee.paymentStatus || "Pending"}
              </span>
            </div>

            {/* Fee Progress Bar */}
            <div className="space-y-1">
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${feePct}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[10px]">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block">Total Fee</span>
                  <span className="font-extrabold text-slate-800">
                    ₹{finalFee.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-100">
                  <span className="text-emerald-700 block">Paid Amount</span>
                  <span className="font-extrabold text-emerald-800">
                    ₹{paid.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-rose-50/70 border border-rose-100">
                  <span className="text-rose-700 block">Balance Due</span>
                  <span className="font-extrabold text-rose-800">
                    ₹{balance.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Receipts List */}
            {profile.payments && profile.payments.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Official Receipts ({profile.payments.length})
                </span>
                <div className="space-y-1 max-h-36 overflow-y-auto custom-scrollbar">
                  {profile.payments.map((p) => (
                    <div
                      key={p._id}
                      className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px]"
                    >
                      <div>
                        <span className="font-mono font-bold text-blue-600 block">
                          #{p.receiptNo}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(p.paymentDate).toLocaleDateString("en-IN")} • {p.paymentMode}
                        </span>
                      </div>
                      <span className="font-extrabold text-emerald-600">
                        ₹{p.amount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Record Fee Installment Inline Form */}
            {balance > 0 && (
              <form
                onSubmit={handleRecordPayment}
                className="pt-2 border-t border-slate-100 space-y-2"
              >
                <span className="text-[10px] font-bold text-slate-700 block">
                  Record Next Fee Installment
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    placeholder="Amount (₹)"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <div className="w-36">
                    <CustomDropdown
                      size="sm"
                      value={payMode}
                      onChange={(val) => setPayMode(val)}
                      options={[
                        { value: "UPI", label: "UPI / GPay" },
                        { value: "Bank Transfer", label: "Bank Transfer" },
                        { value: "Cash", label: "Cash" },
                        { value: "Card", label: "Card" },
                        { value: "Cheque", label: "Cheque" }
                      ]}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={recordingPay || !payAmount}
                    className="py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs transition cursor-pointer"
                  >
                    {recordingPay ? "Saving..." : "Add Payment"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* LMS Website Recorded Course Access & Unlock Engine */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <HiOutlineVideoCamera className="w-4 h-4 text-purple-600" />
                Website LMS Course Access & Video Lessons
              </span>
              <span className="text-[10px] bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded-md border border-purple-100">
                {profile.unlockedCourses?.length || 0} Active
              </span>
            </div>

            {/* Currently Unlocked List */}
            {profile.unlockedCourses && profile.unlockedCourses.length > 0 ? (
              <div className="space-y-1.5">
                {profile.unlockedCourses.map((u) => (
                  <div
                    key={u.courseId}
                    className="p-2.5 rounded-xl bg-purple-50/50 border border-purple-100 flex items-center justify-between text-[11px]"
                  >
                    <div>
                      <span className="font-bold text-slate-800 block">{u.courseTitle}</span>
                      <span className="text-[10px] text-slate-400">
                        Unlocked {new Date(u.unlockedAt).toLocaleDateString("en-IN")} • +₹
                        {u.price.toLocaleString("en-IN")} added to fee ledger
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRevokeCourse(u.courseId)}
                      className="px-2 py-1 bg-white hover:bg-rose-50 text-rose-600 font-bold text-[10px] rounded-lg border border-rose-200 transition cursor-pointer"
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 italic text-[11px]">
                No recorded video courses unlocked on student LMS account yet.
              </p>
            )}

            {/* Unlock New Course Dropdown & Trigger */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="text-[10px] font-bold text-slate-600 block">
                Unlock Catalog Program for this Student
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <CustomDropdown
                    size="sm"
                    value={selectedCourseToUnlock}
                    onChange={(val) => setSelectedCourseToUnlock(val)}
                    placeholder="Select catalog course..."
                    options={catalogCourses.map((c) => ({
                      value: c._id,
                      label: `${c.title} (₹${c.price.toLocaleString("en-IN")})`
                    }))}
                    searchable={true}
                    searchPlaceholder="Search catalog courses..."
                  />
                </div>
                <button
                  type="button"
                  onClick={handleUnlockCourse}
                  disabled={unlocking || !selectedCourseToUnlock}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition cursor-pointer shrink-0 flex items-center gap-1.5"
                >
                  <HiOutlineLockOpen className="w-3.5 h-3.5" />
                  {unlocking ? "Unlocking..." : "Unlock Access"}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 italic leading-tight">
                💡 Unlocking a course creates/links the student's Website LMS account and automatically adds the fee to their ERP ledger.
              </p>
            </div>
          </div>

          {/* Academic & Counselor Notes Timeline */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-1.5">
              <HiOutlineChatAlt2 className="w-4 h-4 text-slate-600" />
              Academic History & Mentorship Notes ({profile.notes?.length || 0})
            </h3>

            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                rows={2}
                placeholder="Log class remarks, mock interview feedback, or fee extension requests..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={addingNote || !newNote.trim()}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition cursor-pointer"
              >
                {addingNote ? "Saving..." : "Log Note"}
              </button>
            </form>

            <div className="space-y-2 pt-1 max-h-48 overflow-y-auto custom-scrollbar">
              {profile.notes && profile.notes.length > 0 ? (
                profile.notes.map((n, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-bold text-slate-700">{n.author || "Counselor"}</span>
                      <span>
                        {new Date(n.createdAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                    <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{n.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 italic text-center py-2">No notes recorded yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Student Mongo ID: {profile._id}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 font-bold rounded-lg text-slate-700 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
