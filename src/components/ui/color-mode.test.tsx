import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "@/components/ui/provider";
import { ColorModeButton } from "@/components/ui/color-mode";

describe("ColorModeProvider", () => {
  beforeEach(() => {
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
    document.documentElement.className = "";
  });

  it("initializes to light and toggles to dark via button", async () => {
    render(
      <Provider>
        <ColorModeButton />
      </Provider>,
    );

    const root = document.documentElement;
    // Provider should set classes
    expect(root).toHaveClass("chakra-theme");
    expect(root).toHaveClass("light");

    const btn = await screen.findByRole("button", {
      name: /toggle color mode/i,
    });
    const user = userEvent.setup();
    await user.click(btn);

    expect(root).toHaveClass("dark");
    expect(localStorage.getItem("sapphillon-theme")).toBe("dark");

    await user.click(btn);
    expect(root).toHaveClass("light");
    expect(localStorage.getItem("sapphillon-theme")).toBe("light");
  });

  it("respects stored theme on first paint", async () => {
    try {
      localStorage.setItem("sapphillon-theme", "dark");
    } catch {
      /* ignore */
    }

    render(
      <Provider>
        <ColorModeButton />
      </Provider>,
    );

    const root = document.documentElement;
    expect(root).toHaveClass("chakra-theme");
    expect(root).toHaveClass("dark");
  });
});
