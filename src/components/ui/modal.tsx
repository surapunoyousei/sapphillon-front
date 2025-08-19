import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils.ts";

/**
 * DaisyUI ベースのモーダル。open 制御は親で行う制御コンポーネント。
 * - Escape で onClose
 * - 背景クリックで onClose (dialog 内 click は閉じない)
 * - オートフォーカス要素 (data-autofocus) があれば初回表示時にフォーカス
 */
export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  className?: string;
  actions?: React.ReactNode; // フッター右側に表示するアクションボタン群
  hideCloseButton?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeMap: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
};

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
  actions,
  hideCloseButton,
  size = "md",
}: ModalProps) {
  const ref = useRef<HTMLDialogElement | null>(null);

  // open 状態同期
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // 初回 open 後 autofocus
      requestAnimationFrame(() => {
        const auto = dialog.querySelector<HTMLElement>("[data-autofocus]");
        auto?.focus();
      });
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Escape & backdrop
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [onClose]);

  if (!open) return null; // unmount で簡易に (DaisyUI 的には残しても良いが)

  const sizeCls = sizeMap[size];

  return (
    <dialog ref={ref} className={cn("modal modal-open", className)}>
      <div
        className={cn("modal-box", sizeCls)}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
            {title}
          </h3>
        )}
        <div className="space-y-4 text-sm">
          {children}
        </div>
        {(actions || !hideCloseButton) && (
          <div className="modal-action mt-6">
            {actions}
            {!hideCloseButton && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={onClose}
              >
                閉じる
              </button>
            )}
          </div>
        )}
      </div>
      {/* backdrop */}
      <form method="dialog" className="modal-backdrop" onClick={onClose}>
        <button aria-label="close" type="button" />
      </form>
    </dialog>
  );
}

export default Modal;
