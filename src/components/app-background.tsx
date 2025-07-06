export function AppBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Main gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-base-100 via-base-200/30 to-base-300/20">
      </div>

      {/* Subtle grid pattern */}
      <div
        className="fixed inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      >
      </div>

      {/* Floating geometric elements */}
      <div className="fixed -right-32 -top-32 w-96 h-96 opacity-[0.03]">
        <div className="relative w-full h-full">
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                width: "24px",
                height: "24px",
                transform: `rotate(${i * 22.5}deg) translateY(-140px)`,
                transformOrigin: "center center",
              }}
            >
              <div className="w-full h-full bg-primary/40 rounded-sm transform rotate-45">
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating circles - top left */}
      <div className="fixed -left-16 -top-16 opacity-[0.04]">
        <div className="grid grid-cols-6 gap-8">
          {[...Array(36)].map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i % 3 === 0
                  ? "bg-primary/30"
                  : i % 3 === 1
                  ? "bg-secondary/30"
                  : "bg-accent/30"
              }`}
            >
            </div>
          ))}
        </div>
      </div>

      {/* Organic blob shapes */}
      <div className="fixed right-1/4 top-1/4 w-64 h-64 opacity-[0.02]">
        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl">
        </div>
      </div>

      <div className="fixed left-1/3 bottom-1/3 w-48 h-48 opacity-[0.02]">
        <div className="w-full h-full bg-gradient-to-tr from-accent/20 to-primary/20 rounded-full blur-2xl">
        </div>
      </div>

      {/* Subtle line patterns */}
      <div className="fixed right-8 top-1/2 opacity-[0.03]">
        <div className="space-y-2">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className={`h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent ${
                i % 2 === 0 ? "w-24" : "w-16"
              }`}
            >
            </div>
          ))}
        </div>
      </div>

      {/* Corner accent */}
      <div className="fixed bottom-8 left-8 opacity-[0.04]">
        <div className="w-32 h-32 border-l-2 border-b-2 border-primary/30 rounded-bl-3xl">
        </div>
      </div>
    </div>
  );
}
