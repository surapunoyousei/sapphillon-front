import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import ja from "./locales/ja.json";
import en from "./locales/en.json";

i18n
  // ブラウザの言語設定を自動検出
  .use(LanguageDetector)
  // react-i18nextを初期化
  .use(initReactI18next)
  // i18nextのオプションを設定
  .init({
    resources: {
      ja: {
        translation: ja,
      },
      en: {
        translation: en,
      },
    },
    fallbackLng: "ja", // フォールバック言語
    defaultNS: "translation",
    interpolation: {
      escapeValue: false, // Reactは既にXSS対策されているため
    },
    detection: {
      // 言語検出の設定
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },
  });

export default i18n;
