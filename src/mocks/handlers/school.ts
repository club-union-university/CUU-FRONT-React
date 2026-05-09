import { http, HttpResponse, delay } from 'msw'
import { API } from './_base'
import { db } from '../db'

export const schoolHandlers = [
  // GET /schools
  http.get(API('/schools'), async ({ request }) => {
    await delay(100)
    const url = new URL(request.url)
    const region = url.searchParams.get('region')
    const whitelistedOnly = url.searchParams.get('whitelistedOnly') !== 'false'
    let list = [...db.schools]
    if (region) list = list.filter((s) => s.region === region)
    if (whitelistedOnly) list = list.filter((s) => s.isWhitelisted)
    return HttpResponse.json(list)
  }),

  // GET /schools/{id}
  http.get(API('/schools/:id'), async ({ params }) => {
    await delay(80)
    const school = db.schools.find((s) => s.id === Number(params.id))
    if (!school) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    return HttpResponse.json(school)
  }),

  // GET /schools/{id}/facilities
  http.get(API('/schools/:id/facilities'), async ({ params, request }) => {
    await delay(100)
    const url = new URL(request.url)
    const facilityType = url.searchParams.get('facilityType')
    let list = db.facilities.filter((f) => f.schoolId === Number(params.id))
    if (facilityType) list = list.filter((f) => f.facilityType === facilityType)
    return HttpResponse.json(list)
  }),
]
