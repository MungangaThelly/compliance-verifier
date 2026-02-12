const envVars = {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
  ALL_ENV_VARS: import.meta.env,
};

const resultEl = document.getElementById("result");
if (resultEl) {
  resultEl.textContent = JSON.stringify(envVars, null, 2);
}
