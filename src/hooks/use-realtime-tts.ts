import { useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface TTSRequest {
  _id: string;
  text: string;
  status: "pending" | "processing" | "completed" | "error";
  voice?: string;
  speed?: number;
  errorMessage?: string;
  _creationTime: number;
}

interface UseRealtimeTTSProps {
  userId?: string;
  onNewRequest?: (request: TTSRequest) => void;
  onStatusUpdate?: (requestId: string, status: string) => void;
}

export function useRealtimeTTS({ userId, onNewRequest, onStatusUpdate }: UseRealtimeTTSProps = {}) {
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connected");
  const [isLive, setIsLive] = useState(true);
  const previousRequests = useRef<TTSRequest[]>([]);
  
  const ttsRequests = useQuery(api.tts.getTTSRequests, { userId });

  // Simulate real-time connection status
  useEffect(() => {
    setConnectionStatus("connecting");
    const timer = setTimeout(() => {
      setConnectionStatus("connected");
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Detect new requests and status changes
  useEffect(() => {
    if (!ttsRequests) return;

    const current = ttsRequests;
    const previous = previousRequests.current;

    // Detect new requests
    const newRequests = current.filter(req => 
      !previous.find(prev => prev._id === req._id)
    );

    newRequests.forEach(request => {
      onNewRequest?.(request);
    });

    // Detect status updates
    current.forEach(currentReq => {
      const previousReq = previous.find(prev => prev._id === currentReq._id);
      if (previousReq && previousReq.status !== currentReq.status) {
        onStatusUpdate?.(currentReq._id, currentReq.status);
      }
    });

    previousRequests.current = current;
  }, [ttsRequests, onNewRequest, onStatusUpdate]);

  // Simulate periodic connection health checks
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      // Simulate occasional connection blips
      if (Math.random() < 0.02) { // 2% chance
        setConnectionStatus("connecting");
        setTimeout(() => setConnectionStatus("connected"), 1000);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive]);

  return {
    connectionStatus,
    isLive,
    setIsLive,
    requests: ttsRequests || [],
    totalRequests: ttsRequests?.length || 0,
  };
}