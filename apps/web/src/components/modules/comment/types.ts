import type {
  BlockAnchor as BaseBlockAnchor,
  RangeAnchor as BaseRangeAnchor,
} from '@haklex/rich-editor'
import type { CommentAnchorModel } from '@mx-space/api-client'

export interface BlockAnchor extends BaseBlockAnchor {
  lang?: string | null
}

export interface RangeAnchor extends BaseRangeAnchor {
  lang?: string | null
}

export type EditorCommentAnchor = BlockAnchor | RangeAnchor

export type CommentAnchor = CommentAnchorModel

export interface CommentBaseProps {
  afterSubmit?: () => void

  anchor?: CommentAnchor | null
  autoFocus?: boolean

  compact?: boolean
  initialValue?: string
  refId: string
}
