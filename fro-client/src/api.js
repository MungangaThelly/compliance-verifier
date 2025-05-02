const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export const SCAN_URL = `${BASE_URL}/api/scan`;
export const NONCE_URL = `${BASE_URL}/api/csp/generate`;
