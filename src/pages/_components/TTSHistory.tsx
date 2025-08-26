import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Clock, Play, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface TTSRequest {
  _id: string;
  text: string;
  status: "pending" | "processing" | "completed" | "error";
  voice?: string;
  speed?: number;
  errorMessage?: string;
  _creationTime: number;
}

interface TTSHistoryProps {
  requests: TTSRequest[];
}

export default function TTSHistory({ requests }: TTSHistoryProps) {
  const handleReplay = (text: string, voice = "alloy", speed = 1.0) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = speechSynthesis.getVoices();
    
    const voiceMap: Record<string, string[]> = {
      alloy: ["Google US English", "Microsoft David", "Alex"],
      echo: ["Google UK English Female", "Microsoft Zira", "Victoria"],
      fable: ["Google UK English Male", "Microsoft Mark", "Daniel"],
      onyx: ["Microsoft David", "Alex", "Google US English"],
      nova: ["Microsoft Zira", "Samantha", "Google US English Female"],
      shimmer: ["Samantha", "Microsoft Zira", "Google US English Female"],
    };

    const preferredVoices = voiceMap[voice] || [];
    const selectedVoice = voices.find(v => 
      preferredVoices.some(pv => v.name.includes(pv.split(' ')[0]))
    ) || voices[0];

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.rate = speed;
    speechSynthesis.speak(utterance);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="size-4 text-yellow-500" />;
      case "processing":
        return <Loader2 className="size-4 text-blue-500 animate-spin" />;
      case "completed":
        return <CheckCircle2 className="size-4 text-green-500" />;
      case "error":
        return <AlertCircle className="size-4 text-red-500" />;
      default:
        return <Clock className="size-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Speech History</CardTitle>
        <CardDescription>
          Your recent text-to-speech requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="size-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No speech history yet</p>
            <p className="text-sm text-muted-foreground">
              Your requests will appear here
            </p>
          </div>
        ) : (
          <ScrollArea className="h-80">
            <div className="space-y-4">
              {requests.map((request, index) => (
                <div key={request._id}>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        <Badge className={`text-xs ${getStatusColor(request.status)}`}>
                          {request.status}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(request._creationTime), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <p className="text-sm line-clamp-3">{request.text}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Voice: {request.voice || "alloy"}</span>
                        <span>•</span>
                        <span>Speed: {(request.speed || 1.0).toFixed(1)}x</span>
                      </div>
                      
                      {request.status === "completed" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleReplay(request.text, request.voice, request.speed)}
                          className="h-7 px-2"
                        >
                          <Play className="size-3 mr-1" />
                          Replay
                        </Button>
                      )}
                    </div>
                    
                    {request.errorMessage && (
                      <div className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                        {request.errorMessage}
                      </div>
                    )}
                  </div>
                  
                  {index < requests.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}