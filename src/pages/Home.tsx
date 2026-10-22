import { Link, useNavigate } from 'react-router'
import { useState } from 'react'
import { ClipboardList, Plus, Settings as SettingsIcon, Trash2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { deleteSurvey, getResponsesFor, getSurveys, getSettings } from '@/lib/storage'
import { uid } from '@/types/survey'

export default function Home() {
  const navigate = useNavigate()
  const [surveys, setSurveys] = useState(getSurveys())
  const settings = getSettings()

  const createSurvey = () => {
    const id = uid()
    navigate(`/build/${id}`)
  }

  const remove = (id: string) => {
    deleteSurvey(id)
    setSurveys(getSurveys())
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">轻问卷</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/settings">
                <SettingsIcon className="mr-1 h-4 w-4" />
                接收设置
              </Link>
            </Button>
            <Button size="sm" onClick={createSurvey}>
              <Plus className="mr-1 h-4 w-4" />
              新建问卷
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {!settings.pushToken && !settings.formspreeId && (
          <Card className="mb-6 border-amber-300 bg-amber-50 dark:bg-amber-950/30">
            <CardContent className="flex items-center justify-between py-4">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                尚未配置结果接收方式：填表人提交后，结果暂时只保存在本机。配置微信推送后，每份结果会秒推送到你的微信。
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link to="/settings">去配置</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {surveys.length === 0 ? (
          <Card className="py-16 text-center">
            <CardHeader>
              <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <CardTitle className="mt-4">还没有问卷</CardTitle>
              <CardDescription>点击“新建问卷”开始创建第一份问卷</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={createSurvey}>
                <Plus className="mr-1 h-4 w-4" />
                新建问卷
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {surveys.map((s) => {
              const count = getResponsesFor(s.id).length
              return (
                <Card key={s.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base leading-snug">{s.title}</CardTitle>
                      <Badge variant={s.open ? 'default' : 'secondary'}>
                        {s.open ? '收集中' : '已停止'}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {s.description || `${s.questions.length} 个问题`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {count} 份结果
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/responses/${s.id}`}>结果</Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/build/${s.id}`}>编辑</Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>删除问卷？</AlertDialogTitle>
                            <AlertDialogDescription>
                              将同时删除该问卷的全部 {count} 份结果，且不可恢复。
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>取消</AlertDialogCancel>
                            <AlertDialogAction onClick={() => remove(s.id)}>删除</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
