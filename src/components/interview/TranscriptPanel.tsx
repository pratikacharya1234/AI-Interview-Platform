"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Brain, User } from "lucide-react"
import type { Transcript } from "@/types/interview"

interface TranscriptPanelProps {
  transcripts: Transcript[]
}

export function TranscriptPanel({ transcripts }: TranscriptPanelProps) {
  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Live Transcript
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <div className="space-y-3">
          {transcripts.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Transcript will appear here once the interview starts</p>
            </div>
          )}
          
          {transcripts.map((transcript) => (
            <div
              key={transcript.id}
              className={`p-3 rounded-lg ${
                transcript.speaker === 'interviewer' 
                  ? 'bg-primary/10 border-l-4 border-primary' 
                  : 'bg-muted'
              }`}
            >
              <div className="flex items-start gap-2">
                {transcript.speaker === 'interviewer' ? (
                  <Brain className="h-4 w-4 mt-0.5 text-primary" />
                ) : (
                  <User className="h-4 w-4 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold">
                      {transcript.speaker === 'interviewer' ? 'AI Interviewer' : 'You'}
                    </span>
                    {transcript.confidence < 1 && (
                      <span className="text-xs text-muted-foreground">
                        {Math.round(transcript.confidence * 100)}% confident
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed">{transcript.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
