import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";

interface QuickStartTextsProps {
  onSelectText: (text: string) => void;
}

const sampleTexts = [
  {
    title: "Welcome Message",
    text: "Welcome to VoiceStream, the ultimate text-to-speech platform. Experience natural-sounding voices with real-time processing.",
  },
  {
    title: "News Headline",
    text: "Breaking: Scientists discover a new method for converting text to speech with unprecedented clarity and naturalness.",
  },
  {
    title: "Product Demo",
    text: "Transform any written content into professional audio with our advanced text-to-speech technology. Choose from multiple voices and adjust speed to suit your needs.",
  },
  {
    title: "Educational Content",
    text: "Did you know that text-to-speech technology helps millions of people with reading difficulties access written content more easily?",
  },
  {
    title: "Poetry Sample",
    text: "Roses are red, violets are blue, VoiceStream makes voices that sound just like you!",
  },
];

export default function QuickStartTexts({ onSelectText }: QuickStartTextsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="size-5" />
          Quick Start
        </CardTitle>
        <CardDescription>
          Try these sample texts to get started quickly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {sampleTexts.map((sample, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">{sample.title}</h4>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSelectText(sample.text)}
                className="h-7 px-2 text-xs"
              >
                Use Text
              </Button>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {sample.text}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}