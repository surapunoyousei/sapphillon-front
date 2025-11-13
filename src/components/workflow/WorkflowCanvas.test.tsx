import { render, screen, waitFor } from "@testing-library/react";
import { Provider as AppProvider } from "@/components/ui/provider";
import type { Workflow } from "@/gen/sapphillon/v1/workflow_pb";
import { describe, expect, it } from "vitest";
import { WorkflowCanvas } from "./WorkflowCanvas";

import { makeWorkflowMock } from "@/test/mocks/workflowMock";

// Use the reusable mock factory
const makeMockWorkflow = (code: string): Workflow => makeWorkflowMock(code);

const simpleWorkflowCode =
    `function workflow() {\n  const x = 1;\n  if (x > 0) {\n    console.log("positive");\n  } else {\n    console.log("non-positive");\n  }\n  return x;\n}\n`;

describe("WorkflowCanvas", () => {
    it("renders actions view for a simple workflow", () => {
        const wf = makeMockWorkflow(simpleWorkflowCode);
        render(
            <AppProvider>
                <WorkflowCanvas workflow={wf} />
            </AppProvider>,
        );

        // Actions view should show the grouped action titles
        expect(screen.getByText("変数を準備")).toBeTruthy();
        expect(screen.getByText("条件分岐")).toBeTruthy();
        expect(screen.getByText("実行結果を返す")).toBeTruthy();

        // The toggle 'Code' button should be present
        expect(screen.getByRole("button", { name: /Code/ })).toBeTruthy();
        // The removed Steps toggle should no longer exist
        expect(screen.queryByRole("button", { name: /Steps/ })).toBeNull();
    });

    it("renders code view", async () => {
        const wf = makeMockWorkflow(simpleWorkflowCode);
        render(
            <AppProvider>
                <WorkflowCanvas workflow={wf} />
            </AppProvider>,
        );

        // Click the Code button to switch view
        const codeBtn = screen.getByRole("button", { name: /Code/ });
        codeBtn.click();

        // Now the raw JS should be visible (wait for re-render)
        await waitFor(() => {
            expect(screen.getByText(/function workflow\(\)/)).toBeTruthy();
        });
    });
});
