"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { AIEvaluation } from "@/types/interview"

interface EvaluationCardProps {
  evaluation: AIEvaluation
}

export function EvaluationCard({ evaluation }: EvaluationCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }
  
  return (
    <Card className="bg-muted">
      <CardContent className="pt-4">
        <h4 className="font-semibold mb-3">Real-time Evaluation</h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Technical:</span>
            <Progress value={evaluation.technical_accuracy * 10} className="mt-1" />
          </div>
          <div>
            <span className="text-muted-foreground">Communication:</span>
            <Progress value={evaluation.communication_clarity * 10} className="mt-1" />
          </div>
          <div>
            <span className="text-muted-foreground">Knowledge:</span>
            <Progress value={evaluation.depth_of_knowledge * 10} className="mt-1" />
          </div>
          <div>
            <span className="text-muted-foreground">Problem Solving:</span>
            <Progress value={evaluation.problem_solving * 10} className="mt-1" />
          </div>
        </div>
        <div className="mt-3 text-center">
          <div className={`text-2xl font-bold ${getScoreColor(evaluation.overall_score)}`}>
            {evaluation.overall_score}%
          </div>
          <p className="text-xs text-muted-foreground">Current Score</p>
        </div>
      </CardContent>
    </Card>
  )
}
