import { useState } from "react";

export function Header() {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      // カスタムイベントを発行してWorkflowInterfaceに通知
      const event = new CustomEvent("executeWorkflow", {
        detail: { goal: prompt.trim() },
      });
      window.dispatchEvent(event);
      setPrompt(""); // 入力欄をクリア
    }
  };

  return (
    <div className="navbar bg-base-200 shadow-sm z-0">
      <div className="navbar-start w-1/4">
        <a className="btn btn-ghost text-xl">Floorp OS</a>
      </div>
      <div className="navbar-center px-4 w-1/2">
        <form onSubmit={handleSubmit} className="w-full max-w-3xl">
          <input
            type="text"
            placeholder="新しいプロンプトを入力..."
            className="input-bordered input w-full"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </form>
      </div>
      <div className="navbar-end w-1/4">
        {/*TODO: ボタンを配置*/}
      </div>
    </div>
  );
}
