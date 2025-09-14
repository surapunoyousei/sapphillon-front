import "@testing-library/jest-dom";

// Silence noisy jsdom CSS parse errors emitted by Emotion/Chakra in tests.
// These occur because jsdom doesn't fully support modern CSS features used in runtime styles.
const originalError = console.error;
console.error = (...args: unknown[]) => {
  try {
    const shouldSilence = args.some((arg) => {
      if (!arg) return false;
      const msg =
        typeof arg === "string" ? arg : (arg as { message?: string }).message;
      return (
        typeof msg === "string" &&
        msg.includes("Could not parse CSS stylesheet")
      );
    });
    if (shouldSilence) return;
  } catch {
    // fallthrough to originalError
  }
  originalError(...args);
};
