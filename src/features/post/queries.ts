import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { STALE_TIMES } from '@/shared/api'
import {
  commentApi,
  commentRootApi,
  postApi,
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
  return useQuery({
    queryKey: postKeys.list(q),
    queryFn: () => postApi.list(q),
    staleTime: STALE_TIMES.short,
    enabled: q.targetId > 0,
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
    mutationFn: (body: CreatePostRequest) => postApi.create(body),
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
    onSuccess: () => qc.invalidateQueries({ queryKey: postKeys.all }),
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
