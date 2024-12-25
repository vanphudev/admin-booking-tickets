/// <reference types="vite/client" />

interface ImportMetaEnv {
   readonly VITE_GLOB_APP_TITLE: string;
   readonly VITE_APP_BASE_API: string;
   readonly VITE_APP_HOMEPAGE: string;
   readonly VITE_APP_BASE_PATH: string;
   readonly VITE_APP_ENV: 'development' | 'production';
   readonly VITE_APP_API_URL: string;
   readonly VITE_GOOGLE_MAPS_API_KEY: string;
}

interface ImportMeta {
   readonly env: ImportMetaEnv;
}
