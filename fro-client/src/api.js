// API Configuration - Backend URL comes from environment variable
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

console.log("🔧 API BASE_URL:", BASE_URL); // Debug: verify the URL being used

export const SCAN_URL = `${BASE_URL}/api/csp/scan`;
export const NONCE_URL = `${BASE_URL}/api/csp/generate`;
