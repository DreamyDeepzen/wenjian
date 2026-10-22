import { Link } from 'react-router'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getSettings, saveSettings } from '@/lib/storage'

export default function SettingsPage() {
  const [formspreeId, setFormspreeId] = useState(getSettings().formspreeId)

  const save = () => {
    saveSettings({ ...getSettings(), formspreeId: formspreeId.trim() })
    toast.success('已保存')
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-6 py-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="mr-1 h-4 w-4" />
              返回
            </Link>
          </Button>
          <h1 className="text-lg font-semibold">接收设置</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-4 px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">把填写结果发送到你的邮箱（Formspree）</CardTitle>
            <CardDescription className="leading-relaxed">
              网站本身是纯静态页面，没有自己的服务器数据库。借助免费的 Formspree 服务，别人提交问卷后，每份结果会自动转发到你的邮箱。
              配置步骤：
              <br />
              1. 打开 <span className="font-medium text-foreground">formspree.io</span>，用邮箱免费注册并验证；
              <br />
              2. 新建一个 Form，复制它给出的 ID（形如 <code className="rounded bg-muted px-1">xgejdrpv</code>，也就是表单地址
              <code className="rounded bg-muted px-1">formspree.io/f/xgejdrpv</code> 的最后一段）；
              <br />
              3. 把 ID 粘贴到下面保存即可。之后你在“结果”页复制的公开填写链接会自动带上这个 ID，任何人提交问卷都会发送到你的邮箱。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fsid">Formspree 表单 ID</Label>
              <Input
                id="fsid"
                value={formspreeId}
                onChange={(e) => setFormspreeId(e.target.value)}
                placeholder="例如：xgejdrpv"
              />
            </div>
            <Button onClick={save}>保存</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">结果保存在哪里？</CardTitle>
            <CardDescription className="leading-relaxed">
              本机浏览器中会保存一份提交记录，方便你在“结果”页查看；线上访客通过公开链接提交时，结果会发送到你的邮箱，并可在
              formspree.io 的 Submissions 面板中查看全部回答。网站是纯静态托管，没有中心化数据库，因此“结果”页表格只汇总本机提交。
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    </div>
  )
}
