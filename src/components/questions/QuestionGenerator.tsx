'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Sparkles, 
  Loader2, 
  Code, 
  Users, 
  Layout, 
  MessageSquare,
  Brain,
  Zap
} from 'lucide-react'

interface QuestionGeneratorProps {
  categories: Array<{
    id: string
    name: string
    slug: string
  }>
  onGenerate: (params: any) => Promise<void>
  isGenerating: boolean
  onClose: () => void
}

export default function QuestionGenerator({
  categories,
  onGenerate,
  isGenerating,
  onClose
}: QuestionGeneratorProps) {
  const [generationType, setGenerationType] = useState('quick')
  const [category, setCategory] = useState('')
  const [subcategory, setSubcategory] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [questionType, setQuestionType] = useState('open_ended')
  const [count, setCount] = useState(5)
  const [experienceLevel, setExperienceLevel] = useState('mid')
  const [specificTopic, setSpecificTopic] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')
  const [temperature, setTemperature] = useState([0.7])
  const [includeCode, setIncludeCode] = useState(false)
  const [language, setLanguage] = useState('javascript')

  const handleGenerate = async () => {
    const params = {
      category: category || categories[0]?.id,
      subcategory,
      difficulty,
      questionType,
      count,
      experienceLevel,
      specificTopic,
      customPrompt,
      temperature: temperature[0],
      ...(includeCode && { language })
    }

    await onGenerate(params)
  }

  const quickTemplates = [
    {
      title: 'Frontend Interview',
      icon: Code,
      params: {
        category: 'technical',
        subcategory: 'Frontend Development',
        questionType: 'coding',
        difficulty: 'medium',
        count: 5,
        specificTopic: 'React, JavaScript, CSS'
      }
    },
    {
      title: 'Behavioral Questions',
      icon: Users,
      params: {
        category: 'behavioral',
        questionType: 'behavioral',
        difficulty: 'medium',
        count: 5,
        specificTopic: 'Leadership, Teamwork, Problem-solving'
      }
    },
    {
      title: 'System Design',
      icon: Layout,
      params: {
        category: 'system-design',
        questionType: 'system_design',
        difficulty: 'hard',
        count: 3,
        specificTopic: 'Scalability, Microservices, Databases'
      }
    },
    {
      title: 'Data Structures',
      icon: Brain,
      params: {
        category: 'technical',
        subcategory: 'Data Structures & Algorithms',
        questionType: 'coding',
        difficulty: 'medium',
        count: 5,
        specificTopic: 'Arrays, Trees, Graphs, Dynamic Programming'
      }
    }
  ]

  return (
    <div className="space-y-6">
      <Tabs value={generationType} onValueChange={setGenerationType}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="quick">Quick Generate</TabsTrigger>
          <TabsTrigger value="custom">Custom Generate</TabsTrigger>
        </TabsList>

        <TabsContent value="quick" className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Choose a template to quickly generate relevant questions
          </p>
          <div className="grid grid-cols-2 gap-4">
            {quickTemplates.map((template) => {
              const Icon = template.icon
              return (
                <Button
                  key={template.title}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-950"
                  onClick={async () => {
                    await onGenerate(template.params)
                  }}
                  disabled={isGenerating}
                >
                  <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium">{template.title}</span>
                  <span className="text-xs text-gray-500">
                    {template.params.count} questions
                  </span>
                </Button>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Subcategory (Optional)</Label>
              <Input
                placeholder="e.g., React, Node.js"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Difficulty Level</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Question Type</Label>
              <Select value={questionType} onValueChange={setQuestionType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open_ended">Open Ended</SelectItem>
                  <SelectItem value="coding">Coding</SelectItem>
                  <SelectItem value="behavioral">Behavioral</SelectItem>
                  <SelectItem value="system_design">System Design</SelectItem>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Experience Level</Label>
              <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="junior">Junior</SelectItem>
                  <SelectItem value="mid">Mid-Level</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                  <SelectItem value="lead">Lead/Principal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Number of Questions</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[count]}
                  onValueChange={(v) => setCount(v[0])}
                  min={1}
                  max={20}
                  step={1}
                  className="flex-1"
                />
                <span className="w-12 text-center font-medium">{count}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Specific Topics (Optional)</Label>
            <Input
              placeholder="e.g., REST APIs, Database Design, React Hooks"
              value={specificTopic}
              onChange={(e) => setSpecificTopic(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Custom Instructions (Optional)</Label>
            <Textarea
              placeholder="Add any specific requirements or focus areas..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Include Code Snippets</Label>
                <p className="text-xs text-gray-500">For coding questions</p>
              </div>
              <Switch
                checked={includeCode}
                onCheckedChange={setIncludeCode}
              />
            </div>

            {includeCode && (
              <div className="space-y-2">
                <Label>Programming Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                    <SelectItem value="go">Go</SelectItem>
                    <SelectItem value="rust">Rust</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>AI Creativity</Label>
                <span className="text-sm text-gray-500">{temperature[0]}</span>
              </div>
              <Slider
                value={temperature}
                onValueChange={setTemperature}
                min={0.1}
                max={1.0}
                step={0.1}
              />
              <p className="text-xs text-gray-500">
                Lower = more focused, Higher = more creative
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isGenerating}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !category}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Questions
                </>
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
