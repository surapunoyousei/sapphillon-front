interface PlaceholderNodeProps {
  message: string;
  x?: number;
  y?: number;
}

export function PlaceholderNode(
  { message, x = 400, y = 200 }: PlaceholderNodeProps,
) {
  return (
    <foreignObject
      x={x - 100}
      y={y - 50}
      width="200"
      height="100"
      className="overflow-visible"
    >
      <div className="w-full h-full flex items-center justify-center">
        <div className="bg-base-300 border-2 border-dashed border-base-content/20 rounded-lg w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="loading loading-spinner loading-md text-primary mb-2">
            </div>
            <p className="text-sm text-base-content/60">{message}</p>
          </div>
        </div>
      </div>
    </foreignObject>
  );
}
