import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Wifi, WifiOff, Loader2, Radio } from "lucide-react";

interface ConnectionStatusProps {
  connectionStatus: "connecting" | "connected" | "disconnected";
  isLive: boolean;
  onToggleLive: (live: boolean) => void;
  totalRequests: number;
}

export default function ConnectionStatus({ 
  connectionStatus, 
  isLive, 
  onToggleLive, 
  totalRequests 
}: ConnectionStatusProps) {
  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "connecting":
        return <Loader2 className="size-4 animate-spin text-yellow-500" />;
      case "connected":
        return <Wifi className="size-4 text-green-500" />;
      case "disconnected":
        return <WifiOff className="size-4 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connecting":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "connected":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "disconnected":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Radio className="size-5" />
          Real-time Status
        </CardTitle>
        <CardDescription>
          Live connection and session information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Connection</span>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Badge className={getStatusColor()}>
              {connectionStatus}
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Requests</span>
          <Badge variant="secondary">{totalRequests}</Badge>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="live-mode" className="text-sm text-muted-foreground">
            Live Updates
          </Label>
          <Switch
            id="live-mode"
            checked={isLive}
            onCheckedChange={onToggleLive}
          />
        </div>

        {connectionStatus === "connected" && isLive && (
          <div className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Receiving real-time updates
          </div>
        )}

        {!isLive && (
          <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
            Live updates paused
          </div>
        )}
      </CardContent>
    </Card>
  );
}