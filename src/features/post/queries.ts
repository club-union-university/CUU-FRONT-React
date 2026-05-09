import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { STALE_TIMES } from '@/shared/api'
import type { Post } from '@/shared/api/types'
import {
  clubPostsApi,
  commentApi,
  commentRootApi,
  eventPostsApi,
  postApi,
  schoolPostsApi,
  type CreatePostRequest,
  type PostListQuery,
  type UpdatePostRequest,
} from './api'

export const postKeys = {
  all: ['post'] as const,
  list: (q: PostListQuery) => [...postKeys.all, 'list', q] as const,
  detail: (id: number) => [...postKeys.all, 'detail', id] as const,
}

export const commentKeys = {
  all: ['comment'] as const,
  forPost: (postId: number) => [...commentKeys.all, 'post', postId] as const,
}

export function usePosts(q: PostListQuery) {
  const hasTarget = q.targetId > 0
  const cat = { category: q.category }

  const enabled =
    hasTarget &&
    (q.boardType === 'EVENT' ||
      q.boardType === 'SCHOOL' ||
      q.boardType === 'CLUB')

  return useQuery({
    queryKey: postKeys.list(q),
    queryFn: (): Promise<Post[]> => {
      if (!hasTarget) return Promise.resolve([])
      switch (q.boardType) {
        case 'EVENT':
          return eventPostsApi.list(q.targetId, cat)
        case 'SCHOOL':
          return schoolPostsApi.list(q.targetId, cat)
        case 'CLUB':
          return clubPostsApi.list(q.targetId, cat)
        default:
          return Promise.resolve([])
      }
    },
    staleTime: STALE_TIMES.short,
    enabled,
  })
}

export function usePost(id: number) {
  return useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => postApi.detail(id),
    staleTime: STALE_TIMES.short,
    enabled: id > 0,
  })
}

export function useCreatePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreatePostRequest) => {
      const payload = {
        category: body.category,
        title: body.title,
        content: body.content,
      }
      if (body.boardType === 'EVENT') {
        return eventPostsApi.create(body.targetId, payload)
      }
      if (body.boardType === 'SCHOOL') {
        return schoolPostsApi.create(body.targetId, payload)
      }
      if (body.boardType === 'CLUB') {
        return clubPostsApi.create(body.targetId, payload)
      }
      return Promise.reject(new Error('지원하지 않는 게시판 유형입니다.'))
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: postKeys.all }),
  })
}

export function useUpdatePost(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdatePostRequest) => postApi.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: postKeys.detail(id) })
      qc.invalidateQueries({ queryKey: postKeys.all })
    },
  })
}

export function useDeletePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => postApi.remove(id),
    onSuccess: (_, id) => {
      qc.removeQueries({ queryKey: postKeys.detail(id) })
      qc.invalidateQueries({ queryKey: postKeys.all })
    },
  })
}

export function useComments(postId: number) {
  return useQuery({
    queryKey: commentKeys.forPost(postId),
    queryFn: () => commentApi.list(postId),
    staleTime: STALE_TIMES.short,
    enabled: postId > 0,
  })
}

export function useCreateComment(postId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (content: string) => commentApi.create(postId, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: commentKeys.forPost(postId) }),
  })
}

export function useDeleteComment(postId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (commentId: number) => commentRootApi.remove(commentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: commentKeys.forPost(postId) }),
  })
}
