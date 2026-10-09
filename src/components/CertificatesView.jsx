import { useState, useRef } from "react";
import {
  HiOutlineAcademicCap,
  HiOutlinePrinter,
  HiOutlineDownload,
  HiOutlineCheckCircle,
  HiOutlineSparkles,
  HiOutlineSearch
} from "react-icons/hi";
import CustomDropdown from "./CustomDropdown.jsx";

const DISTINCTION_GRADES = [
  { value: "A+ (Outstanding Distinction)", label: "A+ (Outstanding Distinction)" },
  { value: "A (First Class with Honours)", label: "A (First Class with Honours)" },
  { value: "B+ (Merit Pass)", label: "B+ (Merit Pass)" },
  { value: "Executive Certified Professional", label: "Executive Certified Professional" }
];

export default function CertificatesView({ students = [] }) {
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?._id || "");
  const [grade, setGrade] = useState(DISTINCTION_GRADES[0].value);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [directorName, setDirectorName] = useState("Maaz Shakeel");
  const [directorTitle, setDirectorTitle] = useState("Academic & Program Director");

  const selectedStudent = students.find((s) => s._id === selectedStudentId) || students[0];

  const studentIdNumber = selectedStudent?.studentId
    ? selectedStudent.studentId.replace("SHIKSHA-", "")
    : "001";
  const certificateId = `SHIKSHA-CERT-${new Date(issueDate).getFullYear()}-${studentIdNumber}`;

  const formattedDate = new Date(issueDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  // 1-Click Browser Print / High-Res PDF Engine
  const handlePrintCertificate = () => {
    const printFrame = document.createElement("iframe");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow.document;

    const certificateHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Certificate — ${selectedStudent?.name || "Student"}</title>
          <style>
            @page {
              size: 297mm 210mm landscape;
              margin: 0;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              width: 297mm;
              height: 210mm;
              margin: 0;
              font-family: 'Georgia', serif;
              background-color: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .cert-outer-border {
              width: 283mm;
              height: 196mm;
              border: 5px solid #1e293b;
              padding: 5mm;
              position: relative;
              background: #fafaf9;
            }
            .cert-inner-border {
              width: 100%;
              height: 100%;
              border: 2px dashed #b8860b;
              padding: 8mm 12mm;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              text-align: center;
              position: relative;
              background: #ffffff;
            }
            .cert-header {
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .cert-org-badge {
              font-family: 'Helvetica Neue', Arial, sans-serif;
              font-size: 11px;
              letter-spacing: 4px;
              color: #b8860b;
              font-weight: 800;
              text-transform: uppercase;
              margin-bottom: 2mm;
            }
            .cert-title {
              font-family: 'Georgia', serif;
              font-size: 34px;
              font-weight: 700;
              color: #0f172a;
              letter-spacing: 1px;
              text-transform: uppercase;
            }
            .cert-subtitle {
              font-family: 'Helvetica Neue', Arial, sans-serif;
              font-size: 12px;
              color: #64748b;
              letter-spacing: 2px;
              text-transform: uppercase;
              margin-top: 1mm;
            }
            .cert-body {
              margin: 4mm 0;
            }
            .cert-present {
              font-style: italic;
              font-size: 15px;
              color: #475569;
            }
            .cert-recipient {
              font-family: 'Georgia', serif;
              font-size: 38px;
              font-weight: 700;
              color: #0284c7;
              margin: 3mm 0;
              text-decoration: underline;
              text-underline-offset: 6px;
            }
            .cert-desc {
              font-family: 'Helvetica Neue', Arial, sans-serif;
              font-size: 13px;
              color: #334155;
              max-width: 220mm;
              margin: 0 auto;
              line-height: 1.6;
            }
            .cert-course {
              font-weight: 700;
              color: #0f172a;
              font-size: 15px;
            }
            .cert-grade-pill {
              display: inline-block;
              margin-top: 3mm;
              padding: 4px 16px;
              border: 1px solid #b8860b;
              border-radius: 20px;
              background: #fffbeb;
              color: #92400e;
              font-family: 'Helvetica Neue', Arial, sans-serif;
              font-size: 12px;
              font-weight: 700;
              letter-spacing: 0.5px;
            }
            .cert-footer {
              display: flex;
              align-items: flex-end;
              justify-content: space-between;
              padding: 0 10mm;
              margin-top: 4mm;
            }
            .cert-sign-col {
              text-align: center;
              width: 60mm;
            }
            .cert-sign-line {
              border-top: 1.5px solid #475569;
              margin-top: 8mm;
              padding-top: 2mm;
            }
            .cert-sign-name {
              font-family: 'Helvetica Neue', Arial, sans-serif;
              font-size: 13px;
              font-weight: 700;
              color: #0f172a;
            }
            .cert-sign-title {
              font-family: 'Helvetica Neue', Arial, sans-serif;
              font-size: 10px;
              color: #64748b;
            }
            .cert-seal {
              width: 32mm;
              height: 32mm;
              border: 3px double #b8860b;
              border-radius: 50%;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              color: #b8860b;
              font-family: 'Helvetica Neue', Arial, sans-serif;
              font-size: 9px;
              font-weight: 800;
              text-align: center;
              letter-spacing: 1px;
            }
            .cert-meta {
              font-family: 'Helvetica Neue', monospace;
              font-size: 10px;
              color: #94a3b8;
              margin-top: 2mm;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="cert-outer-border">
            <div class="cert-inner-border">
              <div class="cert-header">
                <div class="cert-org-badge">SHIKSHA DESIGN &amp; CODING INSTITUTE</div>
                <div class="cert-title">Certificate of Completion</div>
                <div class="cert-subtitle">Official Academic Credential</div>
              </div>

              <div class="cert-body">
                <div class="cert-present">This is proudly conferred upon</div>
                <div class="cert-recipient">${selectedStudent?.name || "Student Name"}</div>
                <div class="cert-desc">
                  having successfully fulfilled all academic curriculum requirements, live cohort assignments, and practical masterclass evaluations for
                  <br>
                  <span class="cert-course">${selectedStudent?.course || "UI/UX Design Masterclass"}</span>
                </div>
                <div>
                  <span class="cert-grade-pill">Grade Awarded: ${grade}</span>
                </div>
              </div>

              <div class="cert-footer">
                <div class="cert-sign-col">
                  <div style="font-family: 'Brush Script MT', cursive; font-size: 24px; color: #1e293b;">${directorName}</div>
                  <div class="cert-sign-line">
                    <div class="cert-sign-name">${directorName}</div>
                    <div class="cert-sign-title">${directorTitle}</div>
                  </div>
                </div>

                <div class="cert-seal">
                  <span>★ VERIFIED ★</span>
                  <span style="font-size: 11px; margin: 2px 0;">SHIKSHA</span>
                  <span>ACADEMY</span>
                </div>

                <div class="cert-sign-col">
                  <div style="font-family: 'Helvetica Neue', sans-serif; font-size: 14px; font-weight: 700; color: #1e293b; height: 28px; display: flex; align-items: center; justify-content: center;">
                    ${formattedDate}
                  </div>
                  <div class="cert-sign-line">
                    <div class="cert-sign-name">Date of Issue</div>
                    <div class="cert-sign-title">New Delhi, India</div>
                  </div>
                </div>
              </div>

              <div class="cert-meta">
                Certificate ID: ${certificateId} • Student Roll No: ${selectedStudent?.studentId || "SHIKSHA-2026-001"} • Verify at shiksha.in/verify
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    frameDoc.open();
    frameDoc.write(certificateHTML);
    frameDoc.close();

    printFrame.contentWindow.focus();
    setTimeout(() => {
      printFrame.contentWindow.print();
      setTimeout(() => {
        document.body.removeChild(printFrame);
      }, 2000);
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="p-4.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <HiOutlineAcademicCap className="w-5 h-5 text-amber-500" />
              Verifiable Printable Certificate Generator
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Generate and print standard A4 Landscape (297mm × 210mm) graduation certificates with 1-click browser print
            </p>
          </div>

          <button
            onClick={handlePrintCertificate}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-sm shadow-amber-500/20 cursor-pointer flex items-center gap-2 transition"
          >
            <HiOutlinePrinter className="w-4 h-4" />
            Print / Save as PDF (A4 Landscape)
          </button>
        </div>

        {/* Configuration Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 text-xs">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Select Student</label>
            <CustomDropdown
              value={selectedStudentId}
              onChange={(val) => setSelectedStudentId(val)}
              options={students.map((s) => ({
                value: s._id,
                label: `${s.name} (${s.studentId}) — ${s.status}`
              }))}
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Distinction Grade</label>
            <CustomDropdown
              value={grade}
              onChange={(val) => setGrade(val)}
              options={DISTINCTION_GRADES}
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Issue Date</label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Authorized Signatory</label>
            <input
              type="text"
              value={directorName}
              onChange={(e) => setDirectorName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Live Certificate Visual Preview (Scaled A4 Landscape Canvas) */}
      <div className="bg-slate-900/90 p-6 sm:p-10 rounded-3xl flex justify-center items-center overflow-x-auto shadow-inner">
        <div
          className="bg-white rounded-lg shadow-2xl relative select-none shrink-0"
          style={{
            width: "820px",
            height: "580px",
            aspectRatio: "297 / 210",
            padding: "20px"
          }}
        >
          {/* Certificate Outer Double Border */}
          <div className="w-full h-full border-4 border-slate-900 p-2 relative bg-stone-50/50">
            {/* Inner Gold Dashed Border */}
            <div className="w-full h-full border-2 border-dashed border-amber-600/80 p-6 flex flex-col justify-between text-center bg-white relative">
              {/* Header */}
              <div>
                <div className="text-[11px] font-extrabold tracking-[0.25em] text-amber-700 uppercase font-sans">
                  SHIKSHA DESIGN &amp; CODING INSTITUTE
                </div>
                <h1 className="text-2xl font-serif font-bold text-slate-900 uppercase tracking-wider mt-1">
                  Certificate of Completion
                </h1>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-sans mt-0.5">
                  Official Academic Credential
                </p>
              </div>

              {/* Recipient Section */}
              <div className="my-2 space-y-1">
                <p className="italic text-slate-500 text-xs font-serif">This is proudly conferred upon</p>
                <div className="text-2xl font-serif font-extrabold text-blue-600 underline underline-offset-4 tracking-wide">
                  {selectedStudent?.name || "Aryan Sharma"}
                </div>
                <p className="text-xs text-slate-600 max-w-lg mx-auto font-sans leading-relaxed pt-1">
                  having successfully fulfilled all academic curriculum requirements, live cohort assignments, and practical masterclass evaluations for
                </p>
                <div className="text-sm font-bold text-slate-900 font-sans">
                  {selectedStudent?.course || "UI/UX Design Masterclass"}
                </div>

                <div className="pt-2">
                  <span className="inline-block px-3 py-1 bg-amber-50 border border-amber-300 text-amber-900 font-bold text-[11px] rounded-full font-sans">
                    Grade Awarded: {grade}
                  </span>
                </div>
              </div>

              {/* Signatures & Seal */}
              <div className="flex items-end justify-between px-6 pt-2 font-sans">
                {/* Director Signature */}
                <div className="text-center w-40">
                  <div className="font-serif italic text-base text-slate-800 font-bold">
                    {directorName}
                  </div>
                  <div className="border-t border-slate-700 mt-1 pt-1">
                    <div className="text-xs font-bold text-slate-900">{directorName}</div>
                    <div className="text-[10px] text-slate-500">{directorTitle}</div>
                  </div>
                </div>

                {/* Gold Seal */}
                <div className="w-18 h-18 rounded-full border-2 border-double border-amber-600 flex flex-col items-center justify-center text-amber-700 text-[8px] font-bold tracking-wider leading-tight shadow-xs">
                  <span>★ VERIFIED ★</span>
                  <span className="text-[10px] font-extrabold text-amber-800">SHIKSHA</span>
                  <span>ACADEMY</span>
                </div>

                {/* Date of Issue */}
                <div className="text-center w-40">
                  <div className="text-xs font-bold text-slate-800 h-6 flex items-center justify-center">
                    {formattedDate}
                  </div>
                  <div className="border-t border-slate-700 mt-1 pt-1">
                    <div className="text-xs font-bold text-slate-900">Date of Issue</div>
                    <div className="text-[10px] text-slate-500">New Delhi, India</div>
                  </div>
                </div>
              </div>

              {/* Footer Meta */}
              <div className="text-[9px] font-mono text-slate-400 border-t border-slate-100 pt-1 flex justify-between">
                <span>Cert ID: {certificateId}</span>
                <span>Roll: {selectedStudent?.studentId || "SHIKSHA-2026-001"}</span>
                <span>Verification: shiksha.in/verify</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
