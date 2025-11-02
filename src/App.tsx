import { AppShell } from "@/components/layout/AppShell";
import { Navigate, Route, Routes } from "react-router-dom";
import { HomePage } from "@/pages/home/Home";
import { GeneratePage } from "@/pages/generate/GeneratePage";
import { WorkflowsPage, WorkflowViewPage } from "@/pages/workflows";

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/generate" element={<GeneratePage />} />
        <Route path="/workflows" element={<WorkflowsPage />} />
        <Route path="/workflows/:id" element={<WorkflowViewPage />} />
        <Route path="/fix" element={<PageBox title="Fix" />} />
        <Route path="/run" element={<PageBox title="Run" />} />
        <Route path="/plugins" element={<PageBox title="Plugins" />} />
        <Route path="/about" element={<PageBox title="About" />} />
      </Routes>
    </AppShell>
  );
}

import { Box, Text } from "@chakra-ui/react";
function PageBox({ title }: { title: string }) {
  return (
    <Box borderWidth="1px" rounded="md" p={4}>
      <Text fontWeight="medium">{title}</Text>
      <Text color="fg.muted">Mock content for {title} page.</Text>
    </Box>
  );
}

export default App;
