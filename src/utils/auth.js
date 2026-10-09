const ERP_TOKEN_KEY = "shiksha_erp_token";
const ERP_USER_KEY = "shiksha_erp_user";

export const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ERP_TOKEN_KEY);
};

export const setToken = (token) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(ERP_TOKEN_KEY, token);
};

export const removeToken = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ERP_TOKEN_KEY);
};

export const getUser = () => {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem(ERP_USER_KEY);
  try {
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const setUser = (user) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(ERP_USER_KEY, JSON.stringify(user));
};

export const removeUser = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ERP_USER_KEY);
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const clearAuth = () => {
  removeToken();
  removeUser();
};
