import { Modal } from "@/components/ui/modal.tsx";

interface Props {
  open: boolean;
  onClose: () => void;
  onDiscard: () => void;
}

export function DiscardWorkflowModal({ open, onClose, onDiscard }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="ワークフロー破棄の確認"
      size="sm"
      actions={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            キャンセル
          </button>
          <button
            type="button"
            className="btn btn-error"
            data-autofocus
            onClick={() => {
              onDiscard();
              onClose();
            }}
          >
            破棄する
          </button>
        </>
      }
    >
      <p className="leading-relaxed text-sm">
        現在の生成 / 修正結果とプロンプト内容をすべて初期化します。
        <br />この操作は元に戻せません。実行してよろしいですか？
      </p>
    </Modal>
  );
}
