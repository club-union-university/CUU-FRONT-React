import type { PostCategory } from '@/shared/api/types'

export const POST_CATEGORIES: { value: PostCategory; label: string }[] = [
  { value: 'NOTICE', label: '공지' },
  { value: 'SCHEDULE', label: '일정' },
  { value: 'TEAM_BUILDING', label: '팀빌딩' },
  { value: 'QNA', label: 'Q&A' },
  { value: 'RESOURCE', label: '자료실' },
]

export function postCategoryLabel(cat: PostCategory | undefined): string {
  if (!cat) return ''
  return POST_CATEGORIES.find((c) => c.value === cat)?.label ?? cat
}
