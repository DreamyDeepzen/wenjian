import type { Response, Survey } from '@/types/survey'

const SURVEYS_KEY = 'wj.surveys'
const RESPONSES_KEY = 'wj.responses'
const SETTINGS_KEY = 'wj.settings'

export interface Settings {
  /** PushPlus token (32-hex) — submissions are pushed to the owner's WeChat */
  pushToken: string
  /** Formspree endpoint id, e.g. xgejdrpv — optional, submissions are also emailed */
  formspreeId: string
  /** owner contact shown on the thanks page */
  ownerEmail: string
}

export function getSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) return { pushToken: '', formspreeId: '', ownerEmail: '', ...(JSON.parse(raw) as Partial<Settings>) }
  } catch {
    /* ignore */
  }
  return { pushToken: '', formspreeId: '', ownerEmail: '' }
}

export function saveSettings(s: Settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
}

export function getSurveys(): Survey[] {
  try {
    const raw = localStorage.getItem(SURVEYS_KEY)
    if (raw) return JSON.parse(raw) as Survey[]
  } catch {
    /* ignore */
  }
  return []
}

export function saveSurveys(surveys: Survey[]) {
  localStorage.setItem(SURVEYS_KEY, JSON.stringify(surveys))
}

export function getSurvey(id: string): Survey | undefined {
  return getSurveys().find((s) => s.id === id)
}

export function upsertSurvey(survey: Survey) {
  const surveys = getSurveys()
  const idx = surveys.findIndex((s) => s.id === survey.id)
  if (idx >= 0) surveys[idx] = survey
  else surveys.push(survey)
  saveSurveys(surveys)
}

export function deleteSurvey(id: string) {
  saveSurveys(getSurveys().filter((s) => s.id !== id))
  localStorage.setItem(
    RESPONSES_KEY,
    JSON.stringify(getResponses().filter((r) => r.surveyId !== id)),
  )
}

export function getResponses(): Response[] {
  try {
    const raw = localStorage.getItem(RESPONSES_KEY)
    if (raw) return JSON.parse(raw) as Response[]
  } catch {
    /* ignore */
  }
  return []
}

export function getResponsesFor(surveyId: string): Response[] {
  return getResponses()
    .filter((r) => r.surveyId === surveyId)
    .sort((a, b) => b.submittedAt - a.submittedAt)
}

export function addResponse(response: Response) {
  const list = getResponses()
  list.push(response)
  localStorage.setItem(RESPONSES_KEY, JSON.stringify(list))
}

export function deleteResponse(id: string) {
  localStorage.setItem(RESPONSES_KEY, JSON.stringify(getResponses().filter((r) => r.id !== id)))
}
