import { useState } from "react";
import {
  HiOutlineUserGroup,
  HiOutlinePlus,
  HiOutlineCalendar,
  HiOutlineUser,
  HiOutlineVideoCamera,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineEye,
  HiOutlineX,
  HiOutlineExternalLink
} from "react-icons/hi";
import { createBatchApi, updateBatchApi, deleteBatchApi } from "../utils/api.js";
import CustomDropdown from "./CustomDropdown.jsx";

const STATUS_BADGES = {
  Upcoming: "bg-blue-50 text-blue-800 border-blue-200",
  Ongoing: "bg-emerald-50 text-emerald-800 border-emerald-200",
  Completed: "bg-slate-100 text-slate-700 border-slate-200"
};

export default function BatchesView({
  batches = [],
  students = [],
  academyCourses = [],
  onRefresh,
  onSelectStudent
}) {
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedRosterBatch, setSelectedRosterBatch] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);

  // Form State
  const [name, setName] = useState("");
  const [course, setCourse] = useState("UI/UX Design Masterclass");
  const [mentorName, setMentorName] = useState("");
  const [schedule, setSchedule] = useState("Sat-Sun 11:00 AM - 1:30 PM");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [maxCapacity, setMaxCapacity] = useState(25);
  const [status, setStatus] = useState("Upcoming");
  const [meetingLink, setMeetingLink] = useState("");
  const [classroomUrl, setClassroomUrl] = useState("");
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const filteredBatches = batches.filter((b) => {
    if (statusFilter !== "All" && b.status !== statusFilter) return false;
    return true;
  });

  const openCreateModal = () => {
    setEditingBatch(null);
    setName("");
    setCourse(academyCourses?.[0]?.title || "UI/UX Design Masterclass");
    setMentorName("");
    setSchedule("Sat-Sun 11:00 AM - 1:30 PM");
    setStartDate(new Date().toISOString().split("T")[0]);
    setEndDate("");
    setMaxCapacity(25);
    setStatus("Upcoming");
    setMeetingLink("");
    setClassroomUrl("");
    setNotes("");
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (batch) => {
    setEditingBatch(batch);
    setName(batch.name || "");
    setCourse(batch.course || "");
    setMentorName(batch.mentorName || "");
    setSchedule(batch.schedule || "");
    setStartDate(batch.startDate ? new Date(batch.startDate).toISOString().split("T")[0] : "");
    setEndDate(batch.endDate ? new Date(batch.endDate).toISOString().split("T")[0] : "");
    setMaxCapacity(batch.maxCapacity || 25);
    setStatus(batch.status || "Upcoming");
    setMeetingLink(batch.meetingLink || "");
    setClassroomUrl(batch.classroomUrl || "");
    setNotes(batch.notes || "");
    setError("");
    setIsModalOpen(true);
  };

  const handleSaveBatch = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Batch cohort name is required.");
      return;
    }
    setSaving(true);
    setError("");

    try {
      const payload = {
        name: name.trim(),
        course,
        mentorName: mentorName.trim(),
        schedule: schedule.trim(),
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        maxCapacity: Number(maxCapacity) || 25,
        status,
        meetingLink: meetingLink.trim(),
        classroomUrl: classroomUrl.trim(),
        notes: notes.trim()
      };

      if (editingBatch) {
        await updateBatchApi(editingBatch._id, payload);
      } else {
        await createBatchApi(payload);
      }

      setIsModalOpen(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err.message || "Failed to save batch cohort.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBatch = async (batchId) => {
    if (!window.confirm("Are you sure you want to delete this batch? Enrolled students will have their batch cleared.")) {
      return;
    }
    setDeletingId(batchId);
    try {
      await deleteBatchApi(batchId);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || "Failed to delete batch");
    } finally {
      setDeletingId(null);
    }
  };

  const batchStudents = selectedRosterBatch
    ? students.filter((s) => s.batch === selectedRosterBatch._id || s.batch?._id === selectedRosterBatch._id)
    : [];

  return (
    <div className="space-y-6">
      {/* Top Header & Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <HiOutlineUserGroup className="w-5 h-5 text-blue-600" />
            Class Batches & Cohorts
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage live schedules, mentor assignments, and student rosters ({batches.length} total cohorts)
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Tabs */}
          <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
            {["All", "Ongoing", "Upcoming", "Completed"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  statusFilter === st
                    ? "bg-white text-blue-600 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-blue-500/20 cursor-pointer transition"
          >
            <HiOutlinePlus className="w-4 h-4" />
            New Cohort Batch
          </button>
        </div>
      </div>

      {/* Batches Grid */}
      {filteredBatches.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <HiOutlineUserGroup className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700">No Batches Found</p>
          <p className="text-xs text-slate-400 mt-1">Create your first class cohort to start assigning students and marking attendance.</p>
          <button
            onClick={openCreateModal}
            className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-blue-700"
          >
            + Create Batch
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
          {filteredBatches.map((b) => {
            const enrolled = b.enrolledCount || 0;
            const maxCap = b.maxCapacity || 25;
            const fillRatio = Math.min(100, Math.round((enrolled / maxCap) * 100));

            return (
              <div
                key={b._id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-md transition flex flex-col justify-between overflow-hidden"
              >
                {/* Batch Top Header */}
                <div className="p-5 pb-3 border-b border-slate-100">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-md">
                        {b.course}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-1.5 line-clamp-1">{b.name}</h3>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        STATUS_BADGES[b.status] || "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  {/* Mentor & Schedule */}
                  <div className="mt-3.5 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <HiOutlineUser className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-700">
                        {b.mentorName ? `Mentor: ${b.mentorName}` : "Mentor: Not Assigned"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HiOutlineCalendar className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-slate-600 font-mono text-[11px]">{b.schedule || "Flexible Timings"}</span>
                    </div>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="px-5 py-3 bg-slate-50/60 border-b border-slate-100 text-xs">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-slate-500 font-medium">Batch Capacity</span>
                    <span className="font-bold text-slate-900">
                      {enrolled} <span className="text-slate-400 font-normal">/ {maxCap} Seats</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        fillRatio >= 100
                          ? "bg-rose-500"
                          : fillRatio >= 75
                          ? "bg-amber-500"
                          : "bg-blue-600"
                      }`}
                      style={{ width: `${fillRatio}%` }}
                    />
                  </div>
                </div>

                {/* Actions & Roster Button */}
                <div className="p-3.5 bg-white flex items-center justify-between gap-2 text-xs">
                  <button
                    onClick={() => setSelectedRosterBatch(b)}
                    className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <HiOutlineEye className="w-4 h-4 text-slate-500" />
                    Roster ({enrolled})
                  </button>

                  {b.meetingLink && (
                    <a
                      href={b.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition"
                      title="Open Live Class Meeting Link"
                    >
                      <HiOutlineVideoCamera className="w-4 h-4" />
                    </a>
                  )}

                  <button
                    onClick={() => openEditModal(b)}
                    className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                    title="Edit Batch Cohort"
                  >
                    <HiOutlinePencil className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteBatch(b._id)}
                    disabled={deletingId === b._id}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer disabled:opacity-50"
                    title="Delete Batch"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Roster Modal */}
      {selectedRosterBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                  {selectedRosterBatch.course}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedRosterBatch.name} — Student Roster</h3>
                <p className="text-xs text-slate-300">
                  {batchStudents.length} Students Currently Allocated • {selectedRosterBatch.schedule}
                </p>
              </div>
              <button
                onClick={() => setSelectedRosterBatch(null)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-2 text-xs">
              {batchStudents.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  No students currently assigned to this batch. Assign students from the Students tab or Student Profile drawer.
                </div>
              ) : (
                batchStudents.map((st) => (
                  <div
                    key={st._id}
                    onClick={() => {
                      setSelectedRosterBatch(null);
                      if (onSelectStudent) onSelectStudent(st);
                    }}
                    className="p-3 bg-slate-50 hover:bg-blue-50/50 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer transition group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] bg-slate-200 text-slate-800 font-bold px-1.5 py-0.5 rounded">
                          {st.studentId}
                        </span>
                        <span className="font-bold text-slate-900 group-hover:text-blue-600 transition">
                          {st.name}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{st.phone} • {st.email || "No email"}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {st.attendanceStats?.percentage || 0}% Attended
                      </span>
                      <HiOutlineExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedRosterBatch(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl cursor-pointer"
              >
                Close Roster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Batch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4.5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingBatch ? "Edit Batch Cohort" : "Create New Batch Cohort"}
                </h3>
                <p className="text-xs text-slate-300">Set schedule, course, mentor, and capacity</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBatch} className="p-6 overflow-y-auto space-y-4 text-xs">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Batch Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekend UI/UX Batch A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Target Course</label>
                <CustomDropdown
                  value={course}
                  onChange={(val) => setCourse(val)}
                  options={[
                    "UI/UX Design Masterclass",
                    "Full Stack Web Development",
                    "React & Next.js Advanced",
                    "Python & AI Engineering",
                    "Graphic Design Pro",
                    ...(academyCourses || []).map((c) => c.title).filter(Boolean)
                  ].map((c) => ({ value: c, label: c }))}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Assigned Mentor</label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={mentorName}
                    onChange={(e) => setMentorName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Max Capacity (Seats)</label>
                  <input
                    type="number"
                    min="1"
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Days & Time Schedule</label>
                <input
                  type="text"
                  placeholder="e.g. Sat-Sun 11:00 AM - 1:30 PM or Mon-Wed-Fri 7:00 PM"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Batch Status</label>
                  <CustomDropdown
                    value={status}
                    onChange={(val) => setStatus(val)}
                    options={[
                      { value: "Upcoming", label: "Upcoming" },
                      { value: "Ongoing", label: "Ongoing" },
                      { value: "Completed", label: "Completed" }
                    ]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Live Meeting Link (Zoom/Meet)</label>
                  <input
                    type="url"
                    placeholder="https://meet.google.com/..."
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Classroom / Drive URL</label>
                  <input
                    type="url"
                    placeholder="https://classroom.google.com/..."
                    value={classroomUrl}
                    onChange={(e) => setClassroomUrl(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Notes / Instructions</label>
                <textarea
                  rows="2"
                  placeholder="Optional mentor instructions or batch prerequisites..."
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
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingBatch ? "Save Changes" : "Create Batch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
