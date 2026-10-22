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
  const settings = getSettings()
  const [pushToken, setPushToken] = useState(settings.pushToken)
  const [formspreeId, setFormspreeId] = useState(settings.formspreeId)

  const save = () => {
    saveSettings({
      ...getSettings(),
      pushToken: pushToken.trim(),
      formspreeId: formspreeId.trim(),
    })
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
            <CardTitle className="text-base">微信接收结果（推荐 · 国内秒到）</CardTitle>
            <CardDescription className="leading-relaxed">
              使用免费的「PushPlus 推送加」服务，别人提交问卷后，回答会直接推送到你的微信。配置步骤：
              <br />
              1. 打开 <span className="font-medium text-foreground">pushplus.plus</span>，点右上角登录，<b>微信扫码</b>登录；
              <br />
              2. 按提示完成<b>实名认证</b>（不认证无法发送，认证后每天免费 200 条，个人问卷完全够用）；
              <br />
              3. 微信里搜索并关注公众号「<b>PushPlus 推送加</b>」；
              <br />
              4. 回到网页，在「发送消息 → 一对一消息」里复制你的 <b>Token</b>（32 位字符串），粘贴到下面保存。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ptoken">PushPlus Token</Label>
              <Input
                id="ptoken"
                value={pushToken}
                onChange={(e) => setPushToken(e.target.value)}
                placeholder="例如：05c3a1b2..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">邮箱接收（可选 · 国外服务较慢）</CardTitle>
            <CardDescription className="leading-relaxed">
              如果也想收到邮件，可填 Formspree 表单 ID（注册较慢，国内网络体验一般，不配也不影响微信推送）。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fsid">Formspree 表单 ID（可选）</Label>
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
              填表人提交后：① 一份保存在其本机浏览器；② 一份推送到你的微信（配置了 PushPlus 时）；③ 同时发邮件（配置了
              Formspree 时）。「结果」页表格只汇总你自己设备上的提交，所以正式收集时以微信/邮件通知为准。
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    </div>
  )
}
