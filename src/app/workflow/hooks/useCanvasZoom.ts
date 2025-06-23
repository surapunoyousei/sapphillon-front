import { useState, useCallback } from "react";

interface CanvasBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export function useCanvasZoom() {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev * 1.2, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev / 1.2, 0.1));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prev) => Math.max(0.1, Math.min(3, prev * delta)));
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 0) {
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
    },
    [pan]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        setPan({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        });
      }
    },
    [isPanning, panStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const calculateViewBox = useCallback(
    (bounds: CanvasBounds): string => {
      const centerX = (bounds.minX + bounds.maxX) / 2;
      const centerY = (bounds.minY + bounds.maxY) / 2;
      const width = (bounds.maxX - bounds.minX) / zoom;
      const height = (bounds.maxY - bounds.minY) / zoom;

      const x = centerX - width / 2 - pan.x / zoom;
      const y = centerY - height / 2 - pan.y / zoom;

      return `${x} ${y} ${width} ${height}`;
    },
    [zoom, pan]
  );

  return {
    zoom,
    pan,
    isPanning,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    calculateViewBox,
  };
}
