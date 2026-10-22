import { Link, useNavigate, useParams } from 'react-router'
import { useEffect, useState } from 'react'
import { ArrowLeft, GripVertical, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { getSurvey, upsertSurvey } from '@/lib/storage'
import { QUESTION_TYPE_LABELS, uid, type Question, type QuestionType, type Survey } from '@/types/survey'

const TYPE_ORDER: QuestionType[] = ['text', 'textarea', 'single', 'multiple', 'dropdown', 'rating']

export default function Builder() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [survey, setSurvey] = useState<Survey | null>(null)

  useEffect(() => {
    const existing = getSurvey(id)
    if (existing) {
      setSurvey(existing)
    } else {
      setSurvey({
        id,
        title: '未命名问卷',
        description: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        questions: [],
        open: true,
      })
    }
  }, [id])

  if (!survey) return null

  const patch = (p: Partial<Survey>) => {
    const next = { ...survey, ...p, updatedAt: Date.now() }
    setSurvey(next)
    upsertSurvey(next)
  }

  const addQuestion = (type: QuestionType) => {
    const q: Question = {
      id: uid(),
      type,
      title: '',
      required: type !== 'text' && type !== 'textarea',
      options: ['single', 'multiple', 'dropdown'].includes(type) ? ['选项 1', '选项 2'] : undefined,
      maxRating: type === 'rating' ? 5 : undefined,
    }
    patch({ questions: [...survey.questions, q] })
  }

  const patchQuestion = (qid: string, p: Partial<Question>) => {
    patch({
      questions: survey.questions.map((q) => (q.id === qid ? { ...q, ...p } : q)),
    })
  }

  const removeQuestion = (qid: string) => {
    patch({ questions: survey.questions.filter((q) => q.id !== qid) })
  }

  const move = (index: number, dir: -1 | 1) => {
    const arr = [...survey.questions]
    const target = index + dir
    if (target < 0 || target >= arr.length) return
    ;[arr[index], arr[target]] = [arr[target], arr[index]]
    patch({ questions: arr })
  }

  const publish = () => {
    if (!survey.title.trim()) {
      toast.error('请先填写问卷标题')
      return
    }
    if (survey.questions.length === 0) {
      toast.error('请至少添加一个问题')
      return
    }
    if (survey.questions.some((q) => !q.title.trim())) {
      toast.error('还有问题没有填写标题')
      return
    }
    upsertSurvey({ ...survey, updatedAt: Date.now() })
    toast.success('问卷已保存')
    navigate(`/fill/${survey.id}`)
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="mr-1 h-4 w-4" />
              返回
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                id="open"
                checked={survey.open}
                onCheckedChange={(v) => patch({ open: v })}
              />
              <Label htmlFor="open" className="text-sm text-muted-foreground">
                {survey.open ? '收集中' : '已停止'}
              </Label>
            </div>
            <Button size="sm" onClick={publish}>
              保存并预览填写页
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 px-6 py-8">
        <Card>
          <CardHeader>
            <Input
              value={survey.title}
              onChange={(e) => patch({ title: e.target.value })}
              placeholder="问卷标题"
              className="border-none px-0 text-xl font-semibold shadow-none focus-visible:ring-0"
            />
            <Textarea
              value={survey.description}
              onChange={(e) => patch({ description: e.target.value })}
              placeholder="问卷说明（选填），向填表人介绍这份问卷"
              className="border-none px-0 shadow-none focus-visible:ring-0"
            />
          </CardHeader>
        </Card>

        {survey.questions.map((q, idx) => (
          <Card key={q.id}>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <Badge variant="secondary">
                  第 {idx + 1} 题 · {QUESTION_TYPE_LABELS[q.type]}
                </Badge>
                <div className="ml-auto flex items-center gap-1">
                  <Button variant="ghost" size="icon" disabled={idx === 0} onClick={() => move(idx, -1)}>
                    ↑
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={idx === survey.questions.length - 1}
                    onClick={() => move(idx, 1)}
                  >
                    ↓
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => removeQuestion(q.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Input
                value={q.title}
                onChange={(e) => patchQuestion(q.id, { title: e.target.value })}
                placeholder="请输入问题"
              />

              {q.type === 'rating' && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  满分
                  <Select
                    value={String(q.maxRating ?? 5)}
                    onValueChange={(v) => patchQuestion(q.id, { maxRating: Number(v) })}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[3, 5, 10].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n} 分
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-primary">{'★'.repeat(q.maxRating ?? 5)}</span>
                </div>
              )}

              {['single', 'multiple', 'dropdown'].includes(q.type) && (
                <div className="space-y-2">
                  {(q.options ?? []).map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <Input
                        value={opt}
                        onChange={(e) => {
                          const options = [...(q.options ?? [])]
                          options[oi] = e.target.value
                          patchQuestion(q.id, { options })
                        }}
                        placeholder={`选项 ${oi + 1}`}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={(q.options ?? []).length <= 2}
                        onClick={() =>
                          patchQuestion(q.id, {
                            options: (q.options ?? []).filter((_, i) => i !== oi),
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => patchQuestion(q.id, { options: [...(q.options ?? []), `选项 ${(q.options ?? []).length + 1}`] })}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    添加选项
                  </Button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Checkbox
                  id={`req-${q.id}`}
                  checked={q.required}
                  onCheckedChange={(v) => patchQuestion(q.id, { required: !!v })}
                />
                <Label htmlFor={`req-${q.id}`} className="text-sm font-normal">
                  必填
                </Label>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardContent className="flex flex-wrap gap-2 pt-6">
            {TYPE_ORDER.map((t) => (
              <Button key={t} variant="outline" size="sm" onClick={() => addQuestion(t)}>
                <Plus className="mr-1 h-4 w-4" />
                {QUESTION_TYPE_LABELS[t]}
              </Button>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
