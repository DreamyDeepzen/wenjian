import { Link, useParams } from 'react-router'
import { useMemo, useState } from 'react'
import { ArrowLeft, Copy, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { deleteResponse, getResponsesFor, getSettings, getSurvey } from '@/lib/storage'
import { encodePayload } from '@/lib/share'

export default function Responses() {
  const { id = '' } = useParams()
  const survey = useMemo(() => getSurvey(id), [id])
  const [responses, setResponses] = useState(() => getResponsesFor(id))

  if (!survey) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <p className="text-muted-foreground">问卷不存在或已被删除。</p>
      </div>
    )
  }

  // The share link embeds the survey definition (and Formspree id) so that
  // anyone — on any device, without the owner's local data — can open and fill it.
  // HashRouter share link: https://host/#/fill/<id>?d=<base64url(JSON)>
  const shareUrl = `${window.location.origin}/#/fill/${survey.id}?d=${encodePayload({
    s: survey,
    f: getSettings().formspreeId,
  })}`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('公开填写链接已复制，任何设备打开都能直接填写')
    } catch {
      toast.error('复制失败，请手动复制地址栏链接')
    }
  }

  const remove = (rid: string) => {
    deleteResponse(rid)
    setResponses(getResponsesFor(id))
  }

  const valueOf = (qid: string, rid: string) => {
    const r = responses.find((x) => x.id === rid)
    const a = r?.answers.find((x) => x.questionId === qid)
    const q = survey.questions.find((x) => x.id === qid)
    const v = a?.value
    if (v === null || v === undefined || v === '') return <span className="text-muted-foreground">—</span>
    if (q?.type === 'rating') return `${v} 分`
    if (Array.isArray(v)) return v.join('、')
    return String(v)
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="mr-1 h-4 w-4" />
                返回
              </Link>
            </Button>
            <h1 className="text-lg font-semibold">{survey.title} · 结果</h1>
            <Badge variant={survey.open ? 'default' : 'secondary'}>
              {survey.open ? '收集中' : '已停止'}
            </Badge>
          </div>
          <Button variant="outline" size="sm" onClick={copyLink}>
            <Copy className="mr-1 h-4 w-4" />
            复制公开填写链接
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {responses.length === 0 ? (
          <Card className="py-16 text-center">
            <CardHeader>
              <CardTitle className="text-base">还没有收到结果</CardTitle>
              <CardDescription>
                把公开填写链接发给其他人，他们提交后结果会发送到你的邮箱；本机测试提交会显示在下方表格
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={copyLink}>复制公开填写链接</Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">共 {responses.length} 份结果</CardTitle>
              <CardDescription>
                下表仅显示本机浏览器中的提交（例如你自己测试填写的）；其他人通过公开链接提交的结果会发送到你的邮箱，也可登录
                formspree.io 在对应表单的 Submissions 中查看全部
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">提交时间</TableHead>
                      {survey.questions.map((q) => (
                        <TableHead key={q.id} className="min-w-32 whitespace-nowrap">
                          {q.title}
                        </TableHead>
                      ))}
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {responses.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {new Date(r.submittedAt).toLocaleString('zh-CN', {
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>
                        {survey.questions.map((q) => (
                          <TableCell key={q.id}>{valueOf(q.id, r.id)}</TableCell>
                        ))}
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => remove(r.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
