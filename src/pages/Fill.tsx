import { Link, useParams } from 'react-router'
import { useMemo, useState } from 'react'
import { CheckCircle2, ClipboardList } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { addResponse, getSettings, getSurvey } from '@/lib/storage'
import { decodePayload } from '@/lib/share'
import { uid, type Answer, type Question } from '@/types/survey'

export default function Fill() {
  const { id = '' } = useParams()
  // survey from the owner's local storage, or embedded in the share link
  // (published static site — respondents have no local copy)
  const { survey, pushToken, formspreeId } = useMemo(() => {
    const local = getSurvey(id)
    if (local) {
      const st = getSettings()
      return { survey: local, pushToken: st.pushToken, formspreeId: st.formspreeId }
    }
    // query lives inside the URL hash (HashRouter): #/fill/<id>?d=...
    const hashQuery = window.location.hash.split('?')[1] ?? ''
    const d = new URLSearchParams(hashQuery).get('d')
    if (d) {
      const payload = decodePayload(d)
      if (payload)
        return {
          survey: payload.s,
          pushToken: payload.p ?? '',
          formspreeId: payload.f ?? '',
        }
    }
    return { survey: undefined, pushToken: '', formspreeId: '' }
  }, [id])

  const [values, setValues] = useState<Record<string, string | string[] | number>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  if (!survey) {
    return (
      <Centered>
        <p className="text-muted-foreground">问卷不存在或已被删除。</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/">返回首页</Link>
        </Button>
      </Centered>
    )
  }

  if (done) {
    return (
      <Centered>
        <CheckCircle2 className="h-14 w-14 text-green-500" />
        <h2 className="mt-4 text-xl font-semibold">提交成功，感谢参与！</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {pushToken || formspreeId
            ? '你的回答已记录，并已发送给问卷发布者。'
            : '你的回答已记录。'}
        </p>
      </Centered>
    )
  }

  if (!survey.open) {
    return (
      <Centered>
        <p className="text-muted-foreground">这份问卷已停止收集。</p>
      </Centered>
    )
  }

  const set = (qid: string, value: string | string[] | number) => {
    setValues((v) => ({ ...v, [qid]: value }))
    setErrors((e) => ({ ...e, [qid]: '' }))
  }

  const submit = async () => {
    const errs: Record<string, string> = {}
    const answers: Answer[] = survey.questions.map((q) => {
      const value = values[q.id] ?? null
      const empty =
        value === null ||
        value === '' ||
        (Array.isArray(value) && value.length === 0)
      if (q.required && empty) errs[q.id] = '此题必填'
      return { questionId: q.id, value }
    })
    setErrors(errs)
    if (Object.keys(errs).length > 0) {
      toast.error('请完成所有必填题')
      return
    }

    setSubmitting(true)
    // 1) save locally so the owner can browse responses in the app
    addResponse({ id: uid(), surveyId: survey.id, submittedAt: Date.now(), answers })

    // 2) push to the owner's WeChat via PushPlus (token embedded in the share link or local settings)
    if (pushToken) {
      const lines: string[] = []
      survey.questions.forEach((q, i) => {
        const a = answers.find((x) => x.questionId === q.id)
        lines.push(`${i + 1}. ${q.title}`)
        lines.push(`   ${formatValue(q, a?.value ?? null)}`)
        lines.push('')
      })
      const content = [
        `问卷：${survey.title}`,
        `提交时间：${new Date().toLocaleString('zh-CN')}`,
        '',
        ...lines,
      ].join('\n')
      try {
        const res = await fetch(
          `https://www.pushplus.plus/send?token=${encodeURIComponent(pushToken)}&title=${encodeURIComponent(
            `【问卷反馈】${survey.title}`,
          )}&content=${encodeURIComponent(content)}`,
        )
        const data = await res.json().catch(() => null)
        if (!res.ok || (data && data.code !== 200)) {
          toast.warning('微信推送失败，结果仍已保存在网站中')
        }
      } catch {
        toast.warning('微信推送失败，结果仍已保存在网站中')
      }
    }

    // 3) forward to the owner's email via Formspree (optional, id embedded in the share link or local settings)
    if (formspreeId) {
      const payload: Record<string, string> = { _subject: `【问卷反馈】${survey.title}` }
      survey.questions.forEach((q) => {
        const a = answers.find((x) => x.questionId === q.id)
        payload[q.title || '未命名问题'] = formatValue(q, a?.value ?? null)
      })
      try {
        await fetch(`https://formspree.io/f/${formspreeId}`, {
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } catch {
        toast.warning('邮件发送失败，结果仍已保存在网站中')
      }
    }
    setSubmitting(false)
    setDone(true)
    window.scrollTo({ top: 0 })
  }

  return (
    <div className="min-h-screen bg-muted/40 py-10">
      <div className="mx-auto max-w-2xl space-y-4 px-4">
        <Card>
          <CardHeader className="text-center">
            <ClipboardList className="mx-auto h-8 w-8 text-primary" />
            <CardTitle className="mt-2 text-2xl">{survey.title}</CardTitle>
            {survey.description && <CardDescription>{survey.description}</CardDescription>}
          </CardHeader>
        </Card>

        {survey.questions.map((q, idx) => (
          <Card key={q.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">
                {idx + 1}. {q.title}
                {q.required && <span className="ml-1 text-destructive">*</span>}
              </CardTitle>
              {errors[q.id] && <CardDescription className="text-destructive">{errors[q.id]}</CardDescription>}
            </CardHeader>
            <CardContent>
              <QuestionInput q={q} value={values[q.id]} onChange={(v) => set(q.id, v)} />
            </CardContent>
          </Card>
        ))}

        <Button className="w-full" size="lg" onClick={submit} disabled={submitting}>
          {submitting ? '提交中…' : '提交'}
        </Button>
        <p className="pb-6 text-center text-xs text-muted-foreground">
          提交即表示你同意问卷发布者收集本次填写内容
        </p>
      </div>
    </div>
  )
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4 text-center">
      {children}
    </div>
  )
}

function formatValue(q: Question, value: Answer['value']): string {
  if (value === null || value === undefined || value === '') return '（未填写）'
  if (q.type === 'rating') return `${value} / ${q.maxRating ?? 5} 分`
  if (Array.isArray(value)) return value.join('、')
  return String(value)
}

function QuestionInput({
  q,
  value,
  onChange,
}: {
  q: Question
  value: string | string[] | number | undefined
  onChange: (v: string | string[] | number) => void
}) {
  switch (q.type) {
    case 'text':
      return (
        <Input
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="请输入"
        />
      )
    case 'textarea':
      return (
        <Textarea
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="请输入"
          rows={4}
        />
      )
    case 'single':
      return (
        <RadioGroup value={(value as string) ?? ''} onValueChange={onChange}>
          {(q.options ?? []).map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <RadioGroupItem value={opt} id={`${q.id}-${i}`} />
              <Label htmlFor={`${q.id}-${i}`} className="font-normal">
                {opt}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )
    case 'multiple': {
      const arr = Array.isArray(value) ? (value as string[]) : []
      return (
        <div className="space-y-2">
          {(q.options ?? []).map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <Checkbox
                id={`${q.id}-${i}`}
                checked={arr.includes(opt)}
                onCheckedChange={(v) =>
                  onChange(v ? [...arr, opt] : arr.filter((x) => x !== opt))
                }
              />
              <Label htmlFor={`${q.id}-${i}`} className="font-normal">
                {opt}
              </Label>
            </div>
          ))}
        </div>
      )
    }
    case 'dropdown':
      return (
        <Select value={(value as string) ?? ''} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="请选择" />
          </SelectTrigger>
          <SelectContent>
            {(q.options ?? []).map((opt, i) => (
              <SelectItem key={i} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    case 'rating': {
      const max = q.maxRating ?? 5
      const current = typeof value === 'number' ? value : 0
      return (
        <div className="flex items-center gap-1">
          {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n === current ? 0 : n)}
              className={`text-2xl transition-colors ${n <= current ? 'text-amber-400' : 'text-muted-foreground/30 hover:text-amber-200'}`}
              aria-label={`${n} 分`}
            >
              ★
            </button>
          ))}
          <span className="ml-2 text-sm text-muted-foreground">
            {current > 0 ? `${current} 分` : '点击打分'}
          </span>
        </div>
      )
    }
  }
}
