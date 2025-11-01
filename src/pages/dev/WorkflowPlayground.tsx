import { Box, Button, Heading, VStack } from "@chakra-ui/react";
import { makeWorkflowMock } from "@/test/mocks/workflowMock";
import { WorkflowCanvas } from "@/components/workflow";

export default function WorkflowPlayground() {
    const sampleCode = `function workflow() {
  const x = 1;
  if (x > 0) {
    console.log("positive");
  } else {
    console.log("non-positive");
  }
  return x;
}`;

    const workflow = makeWorkflowMock(sampleCode);

    return (
        <Box p={6} h="100%">
            <VStack align="start" gap={4} h="100%">
                <Heading size="md">Workflow Playground</Heading>
                <Button
                    onClick={() => {
                        // placeholder for possible future interactions
                        // e.g., update the workflow source dynamically
                        window.alert(
                            "This playground is interactive in the code. For now it just shows the canvas.",
                        );
                    }}
                >
                    Interact
                </Button>
                <Box flex={1} w="100%" h="600px">
                    <WorkflowCanvas workflow={workflow} />
                </Box>
            </VStack>
        </Box>
    );
}
