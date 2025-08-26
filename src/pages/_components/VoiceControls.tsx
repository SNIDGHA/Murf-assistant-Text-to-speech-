import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface VoiceControlsProps {
  voice: string;
  setVoice: (voice: string) => void;
  speed: number[];
  setSpeed: (speed: number[]) => void;
}

const voices = [
  { id: "alloy", name: "Alloy", description: "Neutral and balanced" },
  { id: "echo", name: "Echo", description: "Clear and crisp" },
  { id: "fable", name: "Fable", description: "Expressive and warm" },
  { id: "onyx", name: "Onyx", description: "Deep and authoritative" },
  { id: "nova", name: "Nova", description: "Bright and energetic" },
  { id: "shimmer", name: "Shimmer", description: "Soft and gentle" },
];

export default function VoiceControls({ voice, setVoice, speed, setSpeed }: VoiceControlsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="voice-select">Voice</Label>
        <Select value={voice} onValueChange={setVoice}>
          <SelectTrigger id="voice-select">
            <SelectValue placeholder="Select a voice" />
          </SelectTrigger>
          <SelectContent>
            {voices.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{v.name}</span>
                  <span className="text-xs text-muted-foreground">{v.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="speed-slider">Speed</Label>
          <span className="text-sm text-muted-foreground">{speed[0].toFixed(1)}x</span>
        </div>
        <Slider
          id="speed-slider"
          value={speed}
          onValueChange={setSpeed}
          min={0.5}
          max={2.0}
          step={0.1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0.5x</span>
          <span>2.0x</span>
        </div>
      </div>
    </div>
  );
}