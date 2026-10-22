import type { Survey } from '@/types/survey'

/**
 * The published site is fully static (no database), so the survey definition
 * and the Formspree endpoint travel inside the share link itself:
 *   /fill/<id>?d=<base64url(JSON)>
 * Anyone who opens the link can fill the survey without any server-side state.
 */
export interface SharedPayload {
  s: Survey
  /** PushPlus token — submissions are pushed to the owner's WeChat */
  p?: string
  /** Formspree form id (optional) — submissions are also emailed */
  f?: string
}

export function encodePayload(p: SharedPayload): string {
  const json = JSON.stringify(p)
  const b64 = btoa(unescape(encodeURIComponent(json)))
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodePayload(d: string): SharedPayload | null {
  try {
    const b64 = d.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(escape(atob(b64)))
    const p = JSON.parse(json)
    if (p && p.s && Array.isArray(p.s.questions)) return p as SharedPayload
    return null
  } catch {
    return null
  }
}
