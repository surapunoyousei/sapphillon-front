import type { OnboardingTour } from "@/hooks/useOnboarding";

// ホームページツアー
export const HOME_TOUR: OnboardingTour = {
  id: "home-tour",
  name: "ホームページツアー",
  steps: [
    {
      id: "welcome",
      title: "Sapphillonへようこそ！",
      description:
        "AIを活用したワークフロー自動化プラットフォームです。このツアーでは、基本的な使い方をご紹介します。",
    },
    {
      id: "nav-settings",
      title: "設定",
      description:
        "「Settings」ページで、AIモデルやプロバイダーの設定を行えます。",
      target: '[href="/settings"]',
      placement: "right",
    },
  ],
};

// すべてのツアー
export const TOURS = {
  home: HOME_TOUR,
};


