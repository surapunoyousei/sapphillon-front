import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
}

export function ZoomControls(
  { zoom, onZoomIn, onZoomOut, onZoomReset }: ZoomControlsProps,
) {
  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-base-100 rounded-lg shadow-lg p-2">
      <button
        type="button"
        onClick={onZoomIn}
        className="btn btn-sm btn-ghost"
        title="拡大"
      >
        <ZoomIn className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={onZoomOut}
        className="btn btn-sm btn-ghost"
        title="縮小"
      >
        <ZoomOut className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={onZoomReset}
        className="btn btn-sm btn-ghost"
        title="リセット"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
      <div className="text-xs text-center px-2 py-1 bg-base-200 rounded">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  );
}
