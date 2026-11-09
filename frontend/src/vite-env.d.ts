/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_MS2_URL: string;
  readonly VITE_MS3_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

