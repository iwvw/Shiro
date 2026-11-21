import type {
  EntryTranslation,
  NoteModel,
  NoteWrappedPayload as SdkNoteWrappedPayload,
  Pager,
  PostModel,
} from '@mx-space/api-client'

export type ModelWithTranslation<T> = T & {
  translation?: EntryTranslation | Record<string, EntryTranslation>
}

export type ModelWithLiked<T> = T & { liked?: boolean }

export type PostListItem = PostModel

export type NoteTopicListItem = NoteModel

type NoteWrappedInner = SdkNoteWrappedPayload & {
  liked?: boolean
  translation?: EntryTranslation | Record<string, EntryTranslation>
}

export type NoteWrappedPayload = { data: NoteWrappedInner }

export const dataOf = <T>(response: unknown): T =>
  (response as { data: T }).data

/**
 * 本仓库的 api-client 关闭了信封解包(`getDataFromResponse` 直接返回原始响应),
 * 因此 v3 列表响应是 `{ data, meta: { pagination } }`。
 * 该助手把它规范化成 SDK 的 `PaginateResult` 形状(含 hasNextPage/hasPrevPage)。
 */
export const paginateOf = <T>(
  response: unknown,
): { data: T[]; pagination: Pager } => {
  const r = response as
    | {
        data?: T[]
        meta?: { pagination?: Partial<Pager> }
        pagination?: Partial<Pager>
      }
    | undefined
  const raw = r?.meta?.pagination ?? r?.pagination
  const page = raw?.page ?? 1
  const totalPages = raw?.totalPages ?? 1
  const pagination: Pager = {
    page,
    size: raw?.size ?? 0,
    total: raw?.total ?? 0,
    totalPages,
    hasNextPage: raw?.hasNextPage ?? page < totalPages,
    hasPrevPage: raw?.hasPrevPage ?? page > 1,
  }
  return { data: r?.data ?? [], pagination }
}
