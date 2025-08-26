import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@/hooks/use-auth";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SignInButton } from "@/components/ui/signin";

import { Play, Volume2, Mic, Square, Loader2 } from "lucide-react";
import TTSHistory from "./_components/TTSHistory";
import VoiceControls from "./_components/VoiceControls";
import QuickStartTexts from "./_components/QuickStartTexts";
import ConnectionStatus from "./_components/ConnectionStatus";
import { useRealtimeTTS } from "../hooks/use-realtime-tts";

export default function Index() {
  const { id: userId, isAuthenticated, isLoading: authLoading } = useUser();
  const [text, setText] = useState("");
  const [voice, setVoice] = useState("alloy");
  const [speed, setSpeed] = useState([1]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  const createTTSRequest = useMutation(api.tts.createTTSRequest);
  const updateSession = useMutation(api.tts.updateSession);
  const ttsRequests = useQuery(api.tts.getTTSRequests, { userId: userId || undefined });

  // Real-time TTS connection
  const { connectionStatus, isLive, setIsLive, totalRequests } = useRealtimeTTS({
    userId: userId || undefined,
    onNewRequest: (request) => {
      if (isLive) {
        toast.success("New speech request processed", {
          description: `"${request.text.slice(0, 50)}${request.text.length > 50 ? "..." : ""}"`
        });
      }
    },
    onStatusUpdate: (requestId, status) => {
      if (isLive && status === "completed") {
        toast.info("Speech synthesis completed");
      }
    },
  });

  // Update session status
  useEffect(() => {
    if (isAuthenticated && userId) {
      updateSession({ userId, isActive: true });
      
      const interval = setInterval(() => {
        updateSession({ userId, isActive: true });
      }, 30000); // Update every 30 seconds

      return () => {
        clearInterval(interval);
        updateSession({ userId, isActive: false });
      };
    }
  }, [isAuthenticated, userId, updateSession]);

  const handleSpeak = async () => {
    if (!text.trim()) return;

    // Stop any current speech
    if (currentUtterance) {
      speechSynthesis.cancel();
      setCurrentUtterance(null);
      setIsPlaying(false);
    }

    // Create TTS request in database
    if (isAuthenticated && userId) {
      await createTTSRequest({
        text: text.trim(),
        userId,
        voice,
        speed: speed[0],
      });
    }

    // Use browser's speech synthesis for immediate playback
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = speechSynthesis.getVoices();
    
    // Map our voice names to available system voices
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
    
    utterance.rate = speed[0];
    utterance.pitch = 1;
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => {
      setIsPlaying(false);
      setCurrentUtterance(null);
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      setCurrentUtterance(null);
    };

    setCurrentUtterance(utterance);
    speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    if (currentUtterance) {
      speechSynthesis.cancel();
      setCurrentUtterance(null);
      setIsPlaying(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Volume2 className="size-8 text-primary" />
              <h1 className="text-3xl font-bold">VoiceStream</h1>
              {isAuthenticated && (
                <div className="ml-4 flex items-center gap-2">
                  {connectionStatus === "connected" && isLive && (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600 dark:text-green-400">LIVE</span>
                    </>
                  )}
                  {connectionStatus === "connecting" && (
                    <>
                      <Loader2 className="size-3 animate-spin text-yellow-500" />
                      <span className="text-xs text-yellow-600 dark:text-yellow-400">CONNECTING</span>
                    </>
                  )}
                </div>
              )}
            </div>
            <SignInButton />
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Transform your text into natural-sounding speech instantly with real-time processing
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main TTS Interface */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="size-5" />
                  Text to Speech
                </CardTitle>
                <CardDescription>
                  Enter your text below and click speak to hear it instantly
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter the text you want to convert to speech..."
                  className="min-h-32 resize-none"
                  maxLength={500}
                />
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{text.length}/500 characters</span>
                  {isPlaying && (
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-1 h-3 bg-primary animate-pulse rounded-full"></div>
                        <div className="w-1 h-3 bg-primary animate-pulse rounded-full" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-1 h-3 bg-primary animate-pulse rounded-full" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                      <span>Speaking...</span>
                    </div>
                  )}
                </div>

                <Separator />

                <VoiceControls 
                  voice={voice}
                  setVoice={setVoice}
                  speed={speed}
                  setSpeed={setSpeed}
                />

                <div className="flex gap-2">
                  <Button
                    onClick={handleSpeak}
                    disabled={!text.trim() || isPlaying}
                    className="flex-1"
                    size="lg"
                  >
                    {isPlaying ? (
                      <>
                        <Loader2 className="size-4 mr-2 animate-spin" />
                        Speaking...
                      </>
                    ) : (
                      <>
                        <Play className="size-4 mr-2" />
                        Speak
                      </>
                    )}
                  </Button>
                  
                  {isPlaying && (
                    <Button
                      onClick={handleStop}
                      variant="outline"
                      size="lg"
                    >
                      <Square className="size-4 mr-2" />
                      Stop
                    </Button>
                  )}
                </div>

                {!isAuthenticated && (
                  <div className="bg-muted/50 border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Sign in to save your speech history and access advanced features
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* History Sidebar */}
          <div className="space-y-6">
            <QuickStartTexts onSelectText={setText} />
            
            {isAuthenticated && (
              <ConnectionStatus
                connectionStatus={connectionStatus}
                isLive={isLive}
                onToggleLive={setIsLive}
                totalRequests={totalRequests}
              />
            )}
            
            <TTSHistory requests={ttsRequests || []} />
          </div>
        </div>
      </div>
    </div>
  );
}