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
      id: "nav-generate",
      title: "ワークフローの生成",
      description:
        "「Generate」ページで、自然言語でワークフローを生成できます。",
      target: '[href="/generate"]',
      placement: "right",
    },
    {
      id: "nav-workflows",
      title: "ワークフローの管理",
      description:
        "「Workflows」ページで、作成したワークフローを確認・管理できます。",
      target: '[href="/workflows"]',
      placement: "right",
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

// 生成ページツアー
export const GENERATE_TOUR: OnboardingTour = {
  id: "generate-tour",
  name: "ワークフロー生成ツアー",
  steps: [
    {
      id: "welcome",
      title: "ワークフローを生成しましょう",
      description:
        "このページでは、自然言語でワークフローを生成できます。",
    },
    {
      id: "prompt",
      title: "プロンプト入力",
      description:
        "ここにやりたいことを自然な言葉で入力してください。例：「最新のレポートをダウンロードして、チームにメールで送信する」",
      target: "textarea",
      placement: "bottom",
    },
    {
      id: "templates",
      title: "テンプレート",
      description:
        "テンプレートボタンから、よく使うワークフローのサンプルを選べます。",
      target: 'button:has-text("テンプレート")',
      placement: "bottom",
    },
    {
      id: "history",
      title: "履歴",
      description:
        "過去に使用したプロンプトを履歴から呼び出せます。",
      target: 'button:has-text("履歴")',
      placement: "bottom",
    },
    {
      id: "generate",
      title: "生成",
      description:
        "Generateボタンをクリックするか、Ctrl/Cmd + Enterでワークフローを生成できます。",
      target: 'button:has-text("Generate")',
      placement: "bottom",
    },
    {
      id: "run",
      title: "実行",
      description:
        "生成されたワークフローは、Runパネルから実行できます。",
      target: '[value="run"]',
      placement: "top",
    },
  ],
};

// ワークフローページツアー
export const WORKFLOWS_TOUR: OnboardingTour = {
  id: "workflows-tour",
  name: "ワークフロー管理ツアー",
  steps: [
    {
      id: "welcome",
      title: "ワークフロー一覧",
      description:
        "作成したワークフローがここに表示されます。",
    },
    {
      id: "search",
      title: "検索",
      description:
        "ワークフロー名で検索できます。",
      target: 'input[placeholder*="検索"]',
      placement: "bottom",
    },
    {
      id: "new-workflow",
      title: "新しいワークフロー",
      description:
        "「New Workflow」ボタンから、新しいワークフローを作成できます。",
      target: 'button:has-text("New Workflow")',
      placement: "left",
    },
    {
      id: "actions",
      title: "アクション",
      description:
        "各ワークフローには、表示、実行、複製、削除のアクションがあります。",
    },
  ],
};

// すべてのツアー
export const TOURS = {
  home: HOME_TOUR,
  generate: GENERATE_TOUR,
  workflows: WORKFLOWS_TOUR,
};


