import {
  HiOutlineAcademicCap,
  HiOutlineUserGroup,
  HiOutlineCurrencyRupee,
  HiOutlineTrendingUp,
  HiOutlineClock,
  HiOutlineExclamationCircle,
  HiOutlineCalendar,
  HiOutlineArrowRight
} from "react-icons/hi";

export default function OverviewView({
  stats = {},
  batches = [],
  students = [],
  onSelectStudent,
  onNavigateTab
}) {
  const {
    totalStudents = 0,
    activeStudents = 0,
    completedStudents = 0,
    totalBatches = 0,
    ongoingBatches = 0,
    totalRevenue = 0,
    totalCollected = 0,
    totalDues = 0,
    collectionRatio = 0
  } = stats;

  // Filter students with pending balance
  const dueStudents = students
    .filter((s) => (s.feeDetails?.balance || 0) > 0 && s.status !== "Dropped")
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Financial & Enrollment KPIs Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Students */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 shrink-0">
            <HiOutlineAcademicCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-semibold block">Total Enrolled</span>
            <span className="text-xl font-extrabold text-slate-900">{totalStudents}</span>
          </div>
        </div>

        {/* Active Students */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
            <HiOutlineUserGroup className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-semibold block">Active Scholars</span>
            <span className="text-xl font-extrabold text-emerald-600">{activeStudents}</span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
            <HiOutlineCurrencyRupee className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-semibold block">Projected Revenue</span>
            <span className="text-xl font-extrabold text-slate-900">
              ₹{(totalRevenue / 1000).toFixed(0)}k
            </span>
          </div>
        </div>

        {/* Fees Collected */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
            <HiOutlineTrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-semibold block">Fees Collected</span>
            <span className="text-xl font-extrabold text-emerald-600">
              ₹{(totalCollected / 1000).toFixed(0)}k
            </span>
          </div>
        </div>

        {/* Pending Dues */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600 shrink-0">
            <HiOutlineExclamationCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-semibold block">Outstanding Dues</span>
            <span className="text-xl font-extrabold text-rose-600">
              ₹{(totalDues / 1000).toFixed(0)}k
            </span>
          </div>
        </div>
      </div>

      {/* Collection Progress & Cohort Capacity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Collection Ratio Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Fee Realization Ratio</h3>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
              {collectionRatio}% Collected
            </span>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="w-full h-3.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(collectionRatio, 4))}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>Collected: ₹{totalCollected.toLocaleString("en-IN")}</span>
              <span>Total: ₹{totalRevenue.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px]">Active Batches</span>
              <span className="text-base font-extrabold text-slate-800">
                {totalBatches} Cohorts
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px]">Alumni Graduated</span>
              <span className="text-base font-extrabold text-slate-800">
                {completedStudents} Students
              </span>
            </div>
          </div>
        </div>

        {/* Urgent Balance Dues Alert */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <HiOutlineExclamationCircle className="w-4 h-4 text-rose-500" />
                Urgent Fee Balance Follow-ups
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Students with outstanding installment balances</p>
            </div>
            <button
              onClick={() => onNavigateTab("fees")}
              className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
            >
              View Full Ledger <HiOutlineArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {dueStudents.length === 0 ? (
              <p className="text-slate-400 italic py-6 text-center">
                All student fee installments are fully up to date! 🎉
              </p>
            ) : (
              dueStudents.map((st) => (
                <div
                  key={st._id}
                  onClick={() => onSelectStudent(st)}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/40 border border-slate-200/80 flex items-center justify-between gap-3 transition cursor-pointer group"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 group-hover:text-blue-600 transition block">
                      {st.name} <span className="text-slate-400 font-normal">({st.studentId})</span>
                    </span>
                    <span className="text-[11px] text-slate-500 block truncate max-w-xs">
                      {st.course} • +91 {st.phone}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-extrabold text-rose-600 block">
                      Due: ₹{(st.feeDetails?.balance || 0).toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Paid: ₹{(st.feeDetails?.paidAmount || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Cohorts Live Schedule Preview */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HiOutlineCalendar className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">Active Live Batches</h3>
          </div>
          <button
            onClick={() => onNavigateTab("batches")}
            className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
          >
            Manage Batches <HiOutlineArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {batches.length === 0 ? (
            <p className="text-slate-400 italic text-xs py-4 col-span-full text-center">
              No batches created yet. Click "Batches & Cohorts" to set up your first class cohort.
            </p>
          ) : (
            batches.slice(0, 3).map((b) => (
              <div
                key={b._id}
                className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2.5 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-extrabold text-slate-900 block leading-tight">{b.name}</span>
                    <span className="text-[10px] font-bold text-blue-600 tracking-wider block mt-0.5">
                      {b.batchCode}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      b.status === "Ongoing"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <HiOutlineClock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{b.schedule}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <HiOutlineUserGroup className="w-3.5 h-3.5 text-slate-400" />
                    <span>Mentor: {b.mentorName || "Head Mentor"}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Enrolled:</span>
                  <span className="font-bold text-slate-800">
                    {b.enrolledCount || 0} / {b.maxCapacity || 20} Students
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
