import { BaseApi, apiClient } from '@/shared/api'
import type { BoardType, Comment, Post, PostCategory } from '@/shared/api/types'

export interface PostListQuery {
  boardType: BoardType
  targetId: number
  category?: PostCategory
}

export interface CreatePostRequest {
  boardType: BoardType
  targetId: number
  category?: PostCategory
  title: string
  content: string
}

export interface UpdatePostRequest {
  title?: string
  content?: string
  category?: PostCategory
}

class PostApi extends BaseApi {
  list(q: PostListQuery) {
    return this.get<Post[]>('', { params: q })
  }
  detail(id: number) {
    return this.get<Post>(`/${id}`)
  }
  create(body: CreatePostRequest) {
    return this.post<Post>('', body)
  }
  update(id: number, body: UpdatePostRequest) {
    return this.patch<Post>(`/${id}`, body)
  }
  remove(id: number) {
    return this.delete<void>(`/${id}`)
  }
}

class CommentApi extends BaseApi {
  list(postId: number) {
    return this.get<Comment[]>(`/${postId}/comments`)
  }
  create(postId: number, content: string) {
    return this.post<Comment>(`/${postId}/comments`, { content })
  }
}

class CommentRootApi extends BaseApi {
  remove(id: number) {
    return this.delete<void>(`/${id}`)
  }
}

export const postApi = new PostApi(apiClient, '/posts')
export const commentApi = new CommentApi(apiClient, '/posts')
export const commentRootApi = new CommentRootApi(apiClient, '/comments')
