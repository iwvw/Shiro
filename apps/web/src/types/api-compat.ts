import type {
  EntryTranslation,
  NoteModel,
  NoteWrappedPayload as SdkNoteWrappedPayload,
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
