import { getToken, clearAuth } from "./auth.js";

const getBaseUrl = () => {
  const envUrl = import.meta.env?.VITE_API_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/$/, "");
  }
  return "http://localhost:5000/api";
};

const BASE_URL = getBaseUrl();

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${BASE_URL}${endpoint}`;

  try {
    const res = await fetch(url, { ...options, headers });

    if (res.status === 401) {
      if (!endpoint.includes("/erp/auth/login")) {
        clearAuth();
        if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
          window.location.href = "/login?expired=1";
        }
      }
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || data.message || `Request failed with status ${res.status}`);
    }

    return data;
  } catch (err) {
    console.error(`ERP API Error [${endpoint}]:`, err.message);
    throw err;
  }
}

// 1. Auth API
export const loginApi = (username, password) =>
  request("/erp/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password })
  });

export const verifySessionApi = () =>
  request("/erp/auth/verify", { method: "GET" });

// 2. High-level Stats & Catalog
export const fetchErpStatsApi = () =>
  request("/erp/stats", { method: "GET" });

export const fetchAcademyCoursesApi = () =>
  request("/erp/academy-courses", { method: "GET" });

export const importWonCrmLeadsApi = () =>
  request("/erp/crm-import", { method: "POST" });

// 3. Student Management API
export const fetchStudentsApi = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "All") {
      query.append(key, value);
    }
  });
  const queryString = query.toString();
  return request(`/erp/students${queryString ? `?${queryString}` : ""}`, { method: "GET" });
};

export const fetchStudentByIdApi = (id) =>
  request(`/erp/students/${id}`, { method: "GET" });

export const createStudentApi = (data) =>
  request("/erp/students", {
    method: "POST",
    body: JSON.stringify(data)
  });

export const updateStudentApi = (id, data) =>
  request(`/erp/students/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });

export const deleteStudentApi = (id) =>
  request(`/erp/students/${id}`, { method: "DELETE" });

export const addStudentNoteApi = (id, text, author) =>
  request(`/erp/students/${id}/notes`, {
    method: "POST",
    body: JSON.stringify({ text, author })
  });

export const unlockCourseForStudentApi = (id, courseId, unlockedBy) =>
  request(`/erp/students/${id}/unlock-course`, {
    method: "POST",
    body: JSON.stringify({ courseId, unlockedBy })
  });

export const revokeCourseForStudentApi = (id, courseId, revokedBy) =>
  request(`/erp/students/${id}/revoke-course`, {
    method: "POST",
    body: JSON.stringify({ courseId, revokedBy })
  });

// 4. Batches API
export const fetchBatchesApi = () =>
  request("/erp/batches", { method: "GET" });

export const fetchBatchByIdApi = (id) =>
  request(`/erp/batches/${id}`, { method: "GET" });

export const createBatchApi = (data) =>
  request("/erp/batches", {
    method: "POST",
    body: JSON.stringify(data)
  });

export const updateBatchApi = (id, data) =>
  request(`/erp/batches/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });

export const deleteBatchApi = (id) =>
  request(`/erp/batches/${id}`, { method: "DELETE" });

// 5. Payments API
export const fetchPaymentsApi = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });
  const queryString = query.toString();
  return request(`/erp/payments${queryString ? `?${queryString}` : ""}`, { method: "GET" });
};

export const recordPaymentApi = (data) =>
  request("/erp/payments", {
    method: "POST",
    body: JSON.stringify(data)
  });

// 6. Attendance API
export const saveAttendanceApi = (data) =>
  request("/erp/attendance", {
    method: "POST",
    body: JSON.stringify(data)
  });

export const fetchAttendanceByDateApi = (batchId, dateStr) =>
  request(`/erp/attendance/by-date?batchId=${batchId}&dateStr=${dateStr}`, { method: "GET" });

export const fetchAttendanceHistoryApi = (batchId) =>
  request(`/erp/attendance/history?batchId=${batchId}`, { method: "GET" });
