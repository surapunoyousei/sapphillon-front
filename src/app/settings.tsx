import {
  Bell,
  Palette,
  Settings as SettingsIcon,
  Shield,
  User,
} from "lucide-react";
import { PagePlaceholder } from "@/components/layout/page-placeholder.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/card.tsx";
import { StatusIndicator } from "@/components/ui/status-badge.tsx";

export function Settings() {
  return (
    <PagePlaceholder
      title="Settings"
      description="Configure Floorp OS preferences, automation rules, and system behavior."
      icon={<SettingsIcon size={24} />}
      comingSoon
    >
      {/* Settings Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User size={18} />
              Account & Profile
            </CardTitle>
            <CardDescription>
              Personal information and account preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StatusIndicator variant="neutral">
              User Management System Pending
            </StatusIndicator>
          </CardContent>
        </Card>

        <Card className="bg-secondary/5 border-secondary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell size={18} />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure alerts and notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StatusIndicator variant="warning">
              Notification System In Development
            </StatusIndicator>
          </CardContent>
        </Card>

        <Card className="bg-success/5 border-success/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield size={18} />
              Privacy & Security
            </CardTitle>
            <CardDescription>
              Data protection and security settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StatusIndicator variant="neutral">
              Security Framework Design Phase
            </StatusIndicator>
          </CardContent>
        </Card>

        <Card className="bg-info/5 border-info/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette size={18} />
              Appearance
            </CardTitle>
            <CardDescription>
              Theme, layout, and visual customization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StatusIndicator variant="success">
              Basic Theme System Active
            </StatusIndicator>
          </CardContent>
        </Card>
      </div>

      {/* Current Settings Status */}
      <Card>
        <CardHeader>
          <CardTitle>Settings Implementation Status</CardTitle>
          <CardDescription>
            Progress on various configuration and preference systems
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <StatusIndicator variant="success">
            Theme Switching (Dark/Light Mode)
          </StatusIndicator>
          <StatusIndicator variant="warning">
            Automation Rules Configuration
          </StatusIndicator>
          <StatusIndicator variant="neutral">
            Workflow Preferences
          </StatusIndicator>
          <StatusIndicator variant="neutral">
            Integration Settings
          </StatusIndicator>
          <StatusIndicator variant="neutral">
            Performance Optimization Options
          </StatusIndicator>
        </CardContent>
      </Card>

      {/* Planned Features */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Settings Features</CardTitle>
          <CardDescription>
            Advanced configuration options planned for future releases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Automation Settings</h4>
              <ul className="text-sm text-base-content/70 space-y-1">
                <li>• Workflow execution preferences</li>
                <li>• Auto-save intervals</li>
                <li>• Error handling behavior</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Integration Management</h4>
              <ul className="text-sm text-base-content/70 space-y-1">
                <li>• API key management</li>
                <li>• Service connections</li>
                <li>• Data sync preferences</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </PagePlaceholder>
  );
}
