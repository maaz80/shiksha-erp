import { useState, useEffect } from "react";
import {
  HiOutlineClipboardCheck,
  HiOutlineCalendar,
  HiOutlineUserGroup,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineClock,
  HiOutlineShieldCheck,
  HiOutlineRefresh,
  HiOutlineChevronRight
} from "react-icons/hi";
import {
  saveAttendanceApi,
  fetchAttendanceByDateApi,
  fetchAttendanceHistoryApi
} from "../utils/api.js";
import CustomDropdown from "./CustomDropdown.jsx";

const STATUS_BUTTONS = [
  { value: "Present", label: "Present", color: "bg-emerald-600 text-white border-emerald-600", inactive: "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50" },
  { value: "Absent", label: "Absent", color: "bg-rose-600 text-white border-rose-600", inactive: "bg-white text-rose-700 border-rose-200 hover:bg-rose-50" },
  { value: "Late", label: "Late", color: "bg-amber-500 text-white border-amber-500", inactive: "bg-white text-amber-700 border-amber-200 hover:bg-amber-50" },
  { value: "Excused", label: "Excused", color: "bg-blue-600 text-white border-blue-600", inactive: "bg-white text-blue-700 border-blue-200 hover:bg-blue-50" }
];

export default function AttendanceView({
  batches = [],
  students = [],
  onAttendanceSaved
}) {
  const [selectedBatchId, setSelectedBatchId] = useState(batches[0]?._id || "");
  const [dateStr, setDateStr] = useState(new Date().toISOString().split("T")[0]);
  const [topic, setTopic] = useState("Live Class Session");
  const [markedBy, setMarkedBy] = useState("Mentor");

  // Roster attendance state: map studentId -> { status: "Present"|"Absent"|"Late"|"Excused", remarks: "" }
  const [records, setRecords] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: '' }

  // History state
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Sync selectedBatchId if batches load after mount
  useEffect(() => {
    if (!selectedBatchId && batches.length > 0) {
      setSelectedBatchId(batches[0]._id);
    }
  }, [batches, selectedBatchId]);

  // Students belonging to selected batch
  const batchStudents = students.filter(
    (s) => s.batch === selectedBatchId || s.batch?._id === selectedBatchId
  );

  // Load session attendance & history whenever batch or date changes
  useEffect(() => {
    if (!selectedBatchId) return;

    let isMounted = true;
    const loadSession = async () => {
      setLoading(true);
      setFeedback(null);
      try {
        const res = await fetchAttendanceByDateApi(selectedBatchId, dateStr);
        if (!isMounted) return;

        if (res?.attendance && res.attendance.records?.length > 0) {
          // Existing session found
          const recMap = {};
          res.attendance.records.forEach((r) => {
            const studentId = r.student?._id || r.student;
            recMap[studentId] = {
              status: r.status || "Present",
              remarks: r.remarks || ""
            };
          });
          setRecords(recMap);
          setTopic(res.attendance.topic || "Live Class Session");
          setMarkedBy(res.attendance.markedBy || "Mentor");
        } else {
          // Default all batch students to "Present"
          const recMap = {};
          batchStudents.forEach((st) => {
            recMap[st._id] = { status: "Present", remarks: "" };
          });
          setRecords(recMap);
        }
      } catch (err) {
        console.error("Error loading attendance session:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const loadHistory = async () => {
      setLoadingHistory(true);
      try {
        const histRes = await fetchAttendanceHistoryApi(selectedBatchId);
        if (isMounted && histRes?.success) {
          setHistory(histRes.history || []);
        }
      } catch (err) {
        console.error("Error loading attendance history:", err);
      } finally {
        if (isMounted) setLoadingHistory(false);
      }
    };

    loadSession();
    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [selectedBatchId, dateStr]);

  // Bulk status updates
  const markAllStatus = (newStatus) => {
    const updated = { ...records };
    batchStudents.forEach((st) => {
      updated[st._id] = {
        ...(updated[st._id] || {}),
        status: newStatus
      };
    });
    setRecords(updated);
  };

  const handleStudentStatusChange = (studentId, newStatus) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        status: newStatus
      }
    }));
  };

  const handleStudentRemarkChange = (studentId, remarks) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        remarks
      }
    }));
  };

  const handleSaveAttendance = async (e) => {
    e?.preventDefault();
    if (!selectedBatchId) {
      setFeedback({ type: "error", message: "Please select a batch cohort first." });
      return;
    }
    if (batchStudents.length === 0) {
      setFeedback({ type: "error", message: "This batch has 0 enrolled students." });
      return;
    }

    setSaving(true);
    setFeedback(null);

    try {
      const recordsArray = batchStudents.map((st) => ({
        student: st._id,
        status: records[st._id]?.status || "Present",
        remarks: records[st._id]?.remarks || ""
      }));

      const payload = {
        batchId: selectedBatchId,
        dateStr,
        topic: topic.trim() || "Live Class Session",
        markedBy: markedBy.trim() || "Mentor",
        records: recordsArray
      };

      const res = await saveAttendanceApi(payload);
      if (res?.success) {
        setFeedback({
          type: "success",
          message: `Attendance register saved! Recalculated attendance percentage for ${recordsArray.length} students.`
        });
        if (onAttendanceSaved) onAttendanceSaved();

        // Refresh past sessions history
        const histRes = await fetchAttendanceHistoryApi(selectedBatchId);
        if (histRes?.success) setHistory(histRes.history || []);
      }
    } catch (err) {
      setFeedback({ type: "error", message: err.message || "Failed to save attendance." });
    } finally {
      setSaving(false);
    }
  };

  // Quick summary counts
  const presentCount = batchStudents.filter(
    (st) => (records[st._id]?.status || "Present") === "Present"
  ).length;
  const absentCount = batchStudents.filter(
    (st) => records[st._id]?.status === "Absent"
  ).length;
  const lateCount = batchStudents.filter(
    (st) => records[st._id]?.status === "Late"
  ).length;
  const excusedCount = batchStudents.filter(
    (st) => records[st._id]?.status === "Excused"
  ).length;

  const currentBatch = batches.find((b) => b._id === selectedBatchId);

  return (
    <div className="space-y-6">
      {/* Top Banner / Controls */}
      <div className="p-4.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <HiOutlineClipboardCheck className="w-5 h-5 text-emerald-600" />
              Daily Class Attendance Register
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Mark session attendance and automatically compute cumulative student percentage
            </p>
          </div>

          {feedback && (
            <div
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 animate-in fade-in ${
                feedback.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {feedback.type === "success" ? <HiOutlineCheck className="w-4 h-4" /> : <HiOutlineX className="w-4 h-4" />}
              {feedback.message}
            </div>
          )}
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Select Cohort Batch</label>
            <CustomDropdown
              value={selectedBatchId}
              onChange={(val) => setSelectedBatchId(val)}
              options={batches.map((b) => ({
                value: b._id,
                label: `${b.name} (${b.enrolledCount || 0} students)`
              }))}
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Session Date</label>
            <input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Session Topic / Curriculum</label>
            <input
              type="text"
              placeholder="e.g. Design Systems & Components"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Marked By (Mentor / Staff)</label>
            <input
              type="text"
              placeholder="Mentor Name"
              value={markedBy}
              onChange={(e) => setMarkedBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Quick Bulk Action Buttons & Summary */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">1-Click Actions:</span>
            <button
              type="button"
              onClick={() => markAllStatus("Present")}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              ✓ Mark All Present
            </button>
            <button
              type="button"
              onClick={() => markAllStatus("Absent")}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              ✗ Mark All Absent
            </button>
          </div>

          {/* Counts Badges */}
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg">
              {presentCount} Present
            </span>
            <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-lg">
              {absentCount} Absent
            </span>
            {lateCount > 0 && (
              <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg">
                {lateCount} Late
              </span>
            )}
            {excusedCount > 0 && (
              <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg">
                {excusedCount} Excused
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Attendance Sheet (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Student Register ({batchStudents.length} Enrolled)
                </h3>
                <p className="text-[11px] text-slate-500">
                  {currentBatch?.name || "Selected Batch"} • {dateStr}
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveAttendance}
                disabled={saving || batchStudents.length === 0}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition flex items-center gap-1.5"
              >
                <HiOutlineClipboardCheck className="w-4 h-4" />
                {saving ? "Saving Register..." : "Save Attendance Register"}
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 text-xs">Loading session register...</div>
            ) : batchStudents.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                No students enrolled in this batch. Allocate students to this batch from the Students view.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {batchStudents.map((st) => {
                  const studentRecord = records[st._id] || { status: "Present", remarks: "" };
                  const currentStatus = studentRecord.status || "Present";

                  return (
                    <div
                      key={st._id}
                      className="p-4 hover:bg-slate-50/60 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                    >
                      {/* Student Info */}
                      <div className="min-w-[180px]">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                            {st.studentId}
                          </span>
                          <span className="font-bold text-slate-900">{st.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {st.phone} • Cumulative:{" "}
                          <span className="font-semibold text-slate-600">
                            {st.attendanceStats?.percentage || 0}%
                          </span>
                        </div>
                      </div>

                      {/* Status Toggle Buttons */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {STATUS_BUTTONS.map((btn) => {
                          const isSelected = currentStatus === btn.value;
                          return (
                            <button
                              key={btn.value}
                              type="button"
                              onClick={() => handleStudentStatusChange(st._id, btn.value)}
                              className={`px-3 py-1.5 rounded-xl font-bold border text-xs cursor-pointer transition ${
                                isSelected ? btn.color : btn.inactive
                              }`}
                            >
                              {btn.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Remarks Input */}
                      <div className="w-full sm:w-44">
                        <input
                          type="text"
                          placeholder="Optional remarks..."
                          value={studentRecord.remarks || ""}
                          onChange={(e) => handleStudentRemarkChange(st._id, e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Past Sessions History (1 Column) */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Past Sessions Log
                </h3>
                <p className="text-[11px] text-slate-500">History for {currentBatch?.name || "Batch"}</p>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-lg">
                {history.length}
              </span>
            </div>

            {loadingHistory ? (
              <div className="p-8 text-center text-slate-400 text-xs">Loading past sessions...</div>
            ) : history.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No past sessions recorded yet for this batch. Save today's session to start logging history!
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto text-xs">
                {history.map((sess) => {
                  const isCurrentSelected = sess.dateStr === dateStr;
                  const ratio = sess.totalEnrolled > 0
                    ? Math.round((sess.presentCount / sess.totalEnrolled) * 100)
                    : 0;

                  return (
                    <div
                      key={sess._id}
                      onClick={() => setDateStr(sess.dateStr)}
                      className={`p-3.5 hover:bg-blue-50/40 transition cursor-pointer flex items-center justify-between ${
                        isCurrentSelected ? "bg-blue-50/70 border-l-4 border-blue-600" : ""
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 font-mono text-[11px]">
                            {sess.dateStr}
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                            {sess.markedBy || "Mentor"}
                          </span>
                        </div>
                        <p className="text-slate-600 font-medium mt-0.5 line-clamp-1">{sess.topic}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                          <span className="text-emerald-600 font-bold">{sess.presentCount} Present</span>
                          <span>•</span>
                          <span className="text-rose-500 font-bold">{sess.absentCount} Absent</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                            ratio >= 75
                              ? "bg-emerald-100 text-emerald-800"
                              : ratio >= 50
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {ratio}%
                        </span>
                        <div className="text-[10px] text-blue-600 hover:underline mt-1">Load Date ➜</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
