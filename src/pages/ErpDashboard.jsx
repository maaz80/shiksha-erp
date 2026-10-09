import { useState, useEffect, useCallback } from "react";
import ErpLayout from "../components/ErpLayout.jsx";
import OverviewView from "../components/OverviewView.jsx";
import StudentsView from "../components/StudentsView.jsx";
import BatchesView from "../components/BatchesView.jsx";
import AttendanceView from "../components/AttendanceView.jsx";
import FeesView from "../components/FeesView.jsx";
import CertificatesView from "../components/CertificatesView.jsx";
import StudentProfileDrawer from "../components/StudentProfileDrawer.jsx";
import AddStudentModal from "../components/AddStudentModal.jsx";

import {
  fetchErpStatsApi,
  fetchStudentsApi,
  fetchBatchesApi,
  fetchAcademyCoursesApi,
  importWonCrmLeadsApi,
  createStudentApi
} from "../utils/api.js";

export default function ErpDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Core Data States
  const [stats, setStats] = useState(null);
  const [batches, setBatches] = useState([]);
  const [academyCourses, setAcademyCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 1 });

  // Filters for Students View
  const [searchQuery, setSearchQuery] = useState("");
  const [batchFilter, setBatchFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [feeStatusFilter, setFeeStatusFilter] = useState("All");

  // Modals & Drawers
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);

  // CRM Sync Banner & Loading States
  const [syncingCrm, setSyncingCrm] = useState(false);
  const [syncBanner, setSyncBanner] = useState(null); // { message: "", type: "success" | "error" }
  const [initialLoading, setInitialLoading] = useState(true);

  // 1. Fetch Stats & Batches & Catalog
  const loadCoreMetadata = useCallback(async () => {
    try {
      const [statsRes, batchesRes, coursesRes] = await Promise.all([
        fetchErpStatsApi().catch(() => null),
        fetchBatchesApi().catch(() => null),
        fetchAcademyCoursesApi().catch(() => null)
      ]);

      if (statsRes?.stats) setStats(statsRes.stats);
      if (batchesRes?.batches) setBatches(batchesRes.batches);
      if (coursesRes?.courses) setAcademyCourses(coursesRes.courses);
    } catch (err) {
      console.error("Error loading core ERP metadata:", err);
    }
  }, []);

  // 2. Fetch Students List with current filters
  const loadStudents = useCallback(async (page = 1) => {
    try {
      const res = await fetchStudentsApi({
        page,
        limit: 50,
        search: searchQuery.trim() || undefined,
        batch: batchFilter !== "All" ? batchFilter : undefined,
        status: statusFilter !== "All" ? statusFilter : undefined,
        feeStatus: feeStatusFilter !== "All" ? feeStatusFilter : undefined
      });

      if (res?.success) {
        setStudents(res.students || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  }, [searchQuery, batchFilter, statusFilter, feeStatusFilter]);

  // Initial Mount
  useEffect(() => {
    const init = async () => {
      setInitialLoading(true);
      await Promise.all([loadCoreMetadata(), loadStudents(1)]);
      setInitialLoading(false);
    };
    init();
  }, [loadCoreMetadata, loadStudents]);

  // Handle Real-Time CRM 1-Click Sync
  const handleSyncCrm = async () => {
    setSyncingCrm(true);
    setSyncBanner(null);
    try {
      const res = await importWonCrmLeadsApi();
      if (res?.success) {
        const { importedCount = 0, alreadyExisting = 0 } = res;
        setSyncBanner({
          type: "success",
          message: `CRM Sync Complete: ${importedCount} new enrolled student(s) imported, ${alreadyExisting} already synced.`
        });
        // Reload all data
        await Promise.all([loadCoreMetadata(), loadStudents(1)]);
      }
    } catch (err) {
      setSyncBanner({
        type: "error",
        message: err.message || "Failed to sync CRM leads."
      });
    } finally {
      setSyncingCrm(false);
      // Auto-dismiss banner after 6 seconds
      setTimeout(() => {
        setSyncBanner(null);
      }, 6000);
    }
  };

  // Handle New Student Admission
  const handleStudentCreated = async (payload) => {
    const res = await createStudentApi(payload);
    if (res?.success) {
      await Promise.all([loadCoreMetadata(), loadStudents(1)]);
      if (res.student) {
        setSelectedStudent(res.student);
      }
    }
  };

  // Callback when a student is updated in drawer or deleted
  const handleStudentUpdated = async () => {
    await Promise.all([loadCoreMetadata(), loadStudents(pagination.page)]);
  };

  return (
    <ErpLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      stats={stats}
      onSyncCrm={handleSyncCrm}
      syncingCrm={syncingCrm}
      onNewStudent={() => setIsAddStudentOpen(true)}
      searchQuery={searchQuery}
      onSearchChange={(val) => {
        setSearchQuery(val);
        if (activeTab !== "students") setActiveTab("students");
      }}
    >
      {/* Dynamic CRM Sync Banner */}
      {syncBanner && (
        <div
          className={`mb-4 p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between transition animate-in slide-in-from-top-2 duration-300 ${
            syncBanner.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
              : "bg-rose-50 text-rose-900 border-rose-200"
          }`}
        >
          <span>{syncBanner.message}</span>
          <button
            onClick={() => setSyncBanner(null)}
            className="text-slate-400 hover:text-slate-700 font-bold ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {initialLoading ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-500">Loading Shiksha ERP Workspace...</p>
        </div>
      ) : (
        <>
          {/* 1. Overview Dashboard */}
          {activeTab === "overview" && (
            <OverviewView
              stats={stats}
              batches={batches}
              students={students}
              onSelectStudent={(st) => setSelectedStudent(st)}
              onNewStudent={() => setIsAddStudentOpen(true)}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onViewAllStudents={() => setActiveTab("students")}
              onViewBatches={() => setActiveTab("batches")}
            />
          )}

          {/* 2. Students Directory */}
          {activeTab === "students" && (
            <StudentsView
              students={students}
              batches={batches}
              pagination={pagination}
              onPageChange={(page) => loadStudents(page)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              batchFilter={batchFilter}
              onBatchFilterChange={setBatchFilter}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              feeStatusFilter={feeStatusFilter}
              onFeeStatusFilterChange={setFeeStatusFilter}
              onSelectStudent={(st) => setSelectedStudent(st)}
            />
          )}

          {/* 3. Class Cohort Batches */}
          {activeTab === "batches" && (
            <BatchesView
              batches={batches}
              students={students}
              academyCourses={academyCourses}
              onRefresh={loadCoreMetadata}
              onSelectStudent={(st) => setSelectedStudent(st)}
            />
          )}

          {/* 4. Daily Attendance Register */}
          {activeTab === "attendance" && (
            <AttendanceView
              batches={batches}
              students={students}
              onAttendanceSaved={() => {
                loadCoreMetadata();
                loadStudents(pagination.page);
              }}
            />
          )}

          {/* 5. Financial Fees & Receipts */}
          {activeTab === "fees" && (
            <FeesView
              students={students}
              stats={stats}
              onRefresh={() => {
                loadCoreMetadata();
                loadStudents(pagination.page);
              }}
              onSelectStudent={(st) => setSelectedStudent(st)}
            />
          )}

          {/* 6. Verifiable Printable Certificates */}
          {activeTab === "certificates" && (
            <CertificatesView students={students} />
          )}
        </>
      )}

      {/* Slide-over Student Profile Drawer */}
      <StudentProfileDrawer
        isOpen={Boolean(selectedStudent)}
        student={selectedStudent}
        batches={batches}
        academyCourses={academyCourses}
        onClose={() => setSelectedStudent(null)}
        onStudentUpdated={handleStudentUpdated}
      />

      {/* Manual Admission Modal */}
      <AddStudentModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        batches={batches}
        academyCourses={academyCourses}
        onStudentCreated={handleStudentCreated}
      />
    </ErpLayout>
  );
}
