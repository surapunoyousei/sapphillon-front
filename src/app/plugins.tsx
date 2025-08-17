import { Download, Plug, Shield, Star } from "lucide-react";
import { PagePlaceholder } from "@/components/layout/page-placeholder.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/card.tsx";
import { StatusBadge, StatusIndicator } from "@/components/ui/status-badge.tsx";

export function Plugins() {
  return (
    <PagePlaceholder
      title="Plugin Marketplace"
      description="Discover, install, and manage plugins to extend Floorp OS functionality."
      icon={<Plug size={24} />}
      comingSoon
    >
      {/* Plugin Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/70">
                  Available Plugins
                </p>
                <p className="text-2xl font-bold text-primary">0</p>
              </div>
              <Download className="w-8 h-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-success/5 border-success/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/70">Installed</p>
                <p className="text-2xl font-bold text-success">0</p>
              </div>
              <Shield className="w-8 h-8 text-success/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-warning/5 border-warning/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/70">Featured</p>
                <p className="text-2xl font-bold text-warning">0</p>
              </div>
              <Star className="w-8 h-8 text-warning/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plugin Development Status */}
      <Card>
        <CardHeader>
          <CardTitle>Plugin System Status</CardTitle>
          <CardDescription>
            Development progress of the plugin architecture and marketplace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <StatusIndicator variant="warning">
            Plugin Architecture Design Phase
          </StatusIndicator>
          <StatusIndicator variant="neutral">
            SDK Development Not Started
          </StatusIndicator>
          <StatusIndicator variant="neutral">
            Marketplace Infrastructure Planning
          </StatusIndicator>
          <StatusIndicator variant="neutral">
            Security Sandbox Implementation Pending
          </StatusIndicator>
        </CardContent>
      </Card>

      {/* Future Plugin Categories Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Planned Plugin Categories</CardTitle>
          <CardDescription>
            Types of plugins that will be available in the marketplace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-base-200/30 rounded-lg">
              <p className="text-sm font-medium">Automation</p>
              <StatusBadge variant="info" size="sm">Coming Soon</StatusBadge>
            </div>
            <div className="text-center p-3 bg-base-200/30 rounded-lg">
              <p className="text-sm font-medium">Integrations</p>
              <StatusBadge variant="info" size="sm">Coming Soon</StatusBadge>
            </div>
            <div className="text-center p-3 bg-base-200/30 rounded-lg">
              <p className="text-sm font-medium">UI Themes</p>
              <StatusBadge variant="info" size="sm">Coming Soon</StatusBadge>
            </div>
            <div className="text-center p-3 bg-base-200/30 rounded-lg">
              <p className="text-sm font-medium">Developer Tools</p>
              <StatusBadge variant="info" size="sm">Coming Soon</StatusBadge>
            </div>
          </div>
        </CardContent>
      </Card>
    </PagePlaceholder>
  );
}
