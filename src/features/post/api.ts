import { BaseApi, apiClient } from '@/shared/api'
import type { BoardType, Comment, Post, PostCategory } from '@/shared/api/types'

/** Spring PostController — optional `category` query (same for event / school / club). */
export interface ScopedPostListQuery {
  category?: PostCategory
}

export interface ScopedPostCreateBody {
  category?: PostCategory
  title: string
  content: string
}

export interface PostListQuery {
  boardType: BoardType
  targetId: number
  category?: PostCategory
}

/** 글쓰기 폼 — 대상 id + boardType 으로 이벤트/학교/동아리 POST 경로가 갈라짐. */
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

/**
 * Spring PostController — GET/POST `{base}/{id}/posts` (optional query `category`).
 * `base`: /events | /schools | /clubs
 */
class ScopedPostsApi extends BaseApi {
  list(scopeId: number, q: ScopedPostListQuery = {}) {
    const config =
      q.category !== undefined && q.category !== null
        ? { params: { category: q.category } }
        : undefined
    return this.get<Post[]>(`/${scopeId}/posts`, config)
  }

  create(scopeId: number, body: ScopedPostCreateBody) {
    return this.post<Post>(`/${scopeId}/posts`, body)
  }
}

/** 단건·수정·삭제 — /api/posts/{postId} */
class PostResourceApi extends BaseApi {
  detail(id: number) {
    return this.get<Post>(`/${id}`)
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

export const eventPostsApi = new ScopedPostsApi(apiClient, '/events')
export const schoolPostsApi = new ScopedPostsApi(apiClient, '/schools')
export const clubPostsApi = new ScopedPostsApi(apiClient, '/clubs')
export const postApi = new PostResourceApi(apiClient, '/posts')
export const commentApi = new CommentApi(apiClient, '/posts')
export const commentRootApi = new CommentRootApi(apiClient, '/comments')
