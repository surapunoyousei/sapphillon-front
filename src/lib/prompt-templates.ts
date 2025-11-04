export interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: "automation" | "data" | "communication" | "development" | "other";
  tags: string[];
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  // 自動化カテゴリ
  {
    id: "report-download-email",
    title: "レポートのダウンロードとメール送信",
    description: "最新のレポートをダウンロードしてチームにメール送信",
    prompt:
      "最新の月次レポートをダウンロードして、そのレポートをチーム全員にメールで送信してください。件名は「月次レポート - [現在の日付]」としてください。",
    category: "automation",
    tags: ["メール", "レポート", "自動化"],
  },
  {
    id: "file-backup",
    title: "ファイルのバックアップ",
    description: "指定フォルダのファイルをバックアップ先にコピー",
    prompt:
      "プロジェクトフォルダ内のすべてのドキュメントファイルを検索して、バックアップフォルダにコピーしてください。完了後、バックアップされたファイル数を報告してください。",
    category: "automation",
    tags: ["バックアップ", "ファイル管理"],
  },
  {
    id: "schedule-meeting",
    title: "ミーティングのスケジュール",
    description: "カレンダーに会議を追加し、参加者に通知",
    prompt:
      "来週の火曜日10時に「週次レビュー会議」をスケジュールして、チームメンバー全員を招待してください。会議の議題には進捗確認と課題の共有を含めてください。",
    category: "automation",
    tags: ["カレンダー", "ミーティング", "通知"],
  },

  // データ処理カテゴリ
  {
    id: "csv-analysis",
    title: "CSVデータの分析",
    description: "CSVファイルを読み込んで統計情報を出力",
    prompt:
      "sales_data.csvファイルを読み込んで、月別の売上合計、平均、最大値、最小値を計算してください。結果はわかりやすい表形式で出力してください。",
    category: "data",
    tags: ["CSV", "データ分析", "統計"],
  },
  {
    id: "json-transform",
    title: "JSONデータの変換",
    description: "JSON形式のデータを別の形式に変換",
    prompt:
      "APIから取得したJSONデータを読み込んで、必要なフィールドのみを抽出し、新しいJSON形式に変換してください。変換後のデータをファイルに保存してください。",
    category: "data",
    tags: ["JSON", "データ変換", "API"],
  },
  {
    id: "data-merge",
    title: "複数データソースの統合",
    description: "複数のデータファイルを1つに統合",
    prompt:
      "data1.csv、data2.csv、data3.csvの3つのファイルを読み込んで、共通のキー（ID列）で結合し、統合されたデータを merged_data.csv として保存してください。",
    category: "data",
    tags: ["データ統合", "CSV", "マージ"],
  },

  // コミュニケーションカテゴリ
  {
    id: "daily-report",
    title: "日次レポートの作成と送信",
    description: "本日の作業内容をまとめてレポート送信",
    prompt:
      "本日の作業ログを確認して、完了したタスク、進行中のタスク、発生した問題をまとめた日次レポートを作成し、上司にメールで送信してください。",
    category: "communication",
    tags: ["レポート", "メール", "日次作業"],
  },
  {
    id: "notification-summary",
    title: "通知の集約と要約",
    description: "複数の通知を1つのサマリーにまとめる",
    prompt:
      "過去24時間の通知をすべて確認して、重要度別に分類し、優先度の高いものから順に要約したサマリーを作成してください。",
    category: "communication",
    tags: ["通知", "要約", "優先度"],
  },
  {
    id: "slack-update",
    title: "Slackステータス更新",
    description: "作業状況に応じてSlackステータスを自動更新",
    prompt:
      "現在のカレンダーの予定を確認して、会議中の場合は「会議中」、作業中の場合は「集中作業中」とSlackのステータスを更新してください。",
    category: "communication",
    tags: ["Slack", "ステータス", "自動化"],
  },

  // 開発カテゴリ
  {
    id: "code-review",
    title: "コードレビューの準備",
    description: "変更されたファイルを確認してレビュー用の資料を作成",
    prompt:
      "Gitで変更されたファイルをすべてリストアップして、各ファイルの変更内容の要約を作成してください。レビュー用のMarkdownドキュメントとして出力してください。",
    category: "development",
    tags: ["Git", "コードレビュー", "開発"],
  },
  {
    id: "test-run",
    title: "テストの実行と結果通知",
    description: "テストスイートを実行して結果をチームに通知",
    prompt:
      "プロジェクトのすべてのテストを実行して、テスト結果（成功数、失敗数、失敗したテスト名）をまとめ、Slackの#testチャンネルに通知してください。",
    category: "development",
    tags: ["テスト", "CI/CD", "通知"],
  },
  {
    id: "dependency-update",
    title: "依存関係の更新確認",
    description: "プロジェクトの依存関係に更新があるか確認",
    prompt:
      "package.jsonを確認して、更新可能なパッケージをリストアップしてください。セキュリティアップデートが含まれる場合は優先度を高くマークしてください。",
    category: "development",
    tags: ["依存関係", "セキュリティ", "更新"],
  },

  // その他
  {
    id: "web-scraping",
    title: "Webページからの情報収集",
    description: "指定したWebページから必要な情報を抽出",
    prompt:
      "指定されたWebページにアクセスして、最新のニュース記事のタイトル、URL、公開日を抽出し、CSV形式で保存してください。",
    category: "other",
    tags: ["スクレイピング", "Web", "データ収集"],
  },
  {
    id: "image-resize",
    title: "画像の一括リサイズ",
    description: "フォルダ内の画像を指定サイズにリサイズ",
    prompt:
      "imagesフォルダ内のすべての画像ファイルを800x600ピクセルにリサイズして、resizedフォルダに保存してください。元の画像は保持してください。",
    category: "other",
    tags: ["画像処理", "リサイズ", "バッチ処理"],
  },
  {
    id: "system-health-check",
    title: "システムヘルスチェック",
    description: "システムリソースの使用状況を確認",
    prompt:
      "CPU使用率、メモリ使用率、ディスク空き容量を確認して、いずれかが80%を超えている場合はアラートを送信してください。結果はログファイルにも記録してください。",
    category: "other",
    tags: ["監視", "システム", "アラート"],
  },
];

// カテゴリ別にテンプレートを取得
export function getTemplatesByCategory(category: PromptTemplate["category"]) {
  return PROMPT_TEMPLATES.filter((t) => t.category === category);
}

// タグで検索
export function searchTemplatesByTag(tag: string) {
  return PROMPT_TEMPLATES.filter((t) =>
    t.tags.some((t) => t.toLowerCase().includes(tag.toLowerCase()))
  );
}

// キーワード検索
export function searchTemplates(keyword: string) {
  const lowerKeyword = keyword.toLowerCase();
  return PROMPT_TEMPLATES.filter(
    (t) =>
      t.title.toLowerCase().includes(lowerKeyword) ||
      t.description.toLowerCase().includes(lowerKeyword) ||
      t.prompt.toLowerCase().includes(lowerKeyword) ||
      t.tags.some((tag) => tag.toLowerCase().includes(lowerKeyword))
  );
}

// カテゴリラベルの取得
export function getCategoryLabel(
  category: PromptTemplate["category"]
): string {
  const labels: Record<PromptTemplate["category"], string> = {
    automation: "自動化",
    data: "データ処理",
    communication: "コミュニケーション",
    development: "開発",
    other: "その他",
  };
  return labels[category];
}

// カテゴリカラーの取得
export function getCategoryColor(
  category: PromptTemplate["category"]
): string {
  const colors: Record<PromptTemplate["category"], string> = {
    automation: "blue",
    data: "green",
    communication: "purple",
    development: "orange",
    other: "gray",
  };
  return colors[category];
}


