import React from "react";
import { useTranslation } from "react-i18next";

/**
 * i18n用のカスタムフック
 * 
 * 言語切り替えなどの便利な機能を提供します。
 * 
 * @example
 * ```typescript
 * const { t, changeLanguage, currentLanguage } = useI18n();
 * 
 * // 翻訳
 * <Text>{t("common.copy")}</Text>
 * 
 * // 言語切り替え
 * <Button onClick={() => changeLanguage("en")}>English</Button>
 * 
 * // 現在の言語を取得
 * console.log(currentLanguage); // "ja" or "en"
 * ```
 */
export function useI18n() {
  const { t, i18n } = useTranslation();

  const changeLanguage = React.useCallback(
    (lang: "ja" | "en") => {
      i18n.changeLanguage(lang);
    },
    [i18n]
  );

  return {
    t,
    changeLanguage,
    currentLanguage: i18n.language as "ja" | "en",
    i18n,
  };
}

