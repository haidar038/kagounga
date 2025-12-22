import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

i18n.use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        lng: "en",
        fallbackLng: "en",
        supportedLngs: ["en", "id"],
        debug: import.meta.env.DEV,
        interpolation: {
            escapeValue: false, // React already escapes by default
        },
        backend: {
            loadPath: "/locales/{{lng}}/translation.json",
        },
        detection: {
            order: ["localStorage", "navigator", "htmlTag"],
            caches: ["localStorage"],
            lookupLocalStorage: "i18nextLng",
        },
    });

export default i18n;
