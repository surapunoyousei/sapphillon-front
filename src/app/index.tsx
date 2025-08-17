import { Activity, LayoutDashboard, Settings, Users } from "lucide-react";
import { PagePlaceholder } from "@/components/layout/page-placeholder.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/card.tsx";
import { StatusIndicator } from "@/components/ui/status-badge.tsx";

export function Home() {
  return (
    <PagePlaceholder
      title="Dashboard"
      description="Your central command center for Floorp OS automation and workflow management."
      icon={<LayoutDashboard size={24} />}
      comingSoon
    >
      {/* Quick Stats Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/70">Active Workflows</p>
                <p className="text-2xl font-bold text-primary">0</p>
              </div>
              <Activity className="w-8 h-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-success/5 border-success/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/70">Automations</p>
                <p className="text-2xl font-bold text-success">0</p>
              </div>
              <Settings className="w-8 h-8 text-success/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-info/5 border-info/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/70">Integrations</p>
                <p className="text-2xl font-bold text-info">0</p>
              </div>
              <Users className="w-8 h-8 text-info/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>
            Current status of Floorp OS components and services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <StatusIndicator variant="success">
            BrowserOS API Connected
          </StatusIndicator>
          <StatusIndicator variant="warning">
            Sapphillon Backend (Mock Mode)
          </StatusIndicator>
          <StatusIndicator variant="neutral">
            Workflow Engine (Not Started)
          </StatusIndicator>
        </CardContent>
      </Card>
    </PagePlaceholder>
  );
}
