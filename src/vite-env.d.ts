/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string;
  readonly VITE_FIREBASE_FIRESTORE_DATABASE_ID?: string;
  readonly VITE_CLOUDINARY_CLOUD_NAME?: string;
  readonly VITE_CLOUDINARY_UPLOAD_PRESET?: string;
  readonly VITE_LLM_API_KEY?: string;
  readonly VITE_LLM_BASE_URL?: string;
  readonly VITE_LLM_MODEL?: string;
  readonly VITE_VECTOR_STORE_ID?: string;
  readonly VITE_HCM_CHAPTER5_VECTOR_STORE_ID?: string;
  readonly VITE_HCM_TEXTBOOK_VECTOR_STORE_ID?: string;
  readonly VITE_FILE_SEARCH_MAX_RESULTS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
