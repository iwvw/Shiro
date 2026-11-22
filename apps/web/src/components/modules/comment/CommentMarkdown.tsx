import { RuleType } from 'markdown-to-jsx'
import type { FC } from 'react'

import { Markdown } from '~/components/ui/markdown'
import { useTypeScriptHappyCallback } from '~/hooks/common/use-callback'

import { useCommentMarkdownContainerRefSetter } from './CommentProvider'

// NOTE: import `RuleType` from `markdown-to-jsx` directly instead of the
// `~/components/ui/markdown` barrel. The barrel re-exports it via a getter that
// resolves the `markdown-to-jsx` namespace at module-init time; reading it at
// this module's top level (below) triggers that getter while the barrel is still
// mid-initialization through a circular import, throwing
// `Cannot read properties of undefined (reading 'D2')`.
const disabledTypes = [
  RuleType.footnote,
  RuleType.footnoteReference,
  RuleType.htmlComment,
  RuleType.htmlSelfClosing,
  RuleType.htmlBlock,
]

export const CommentMarkdown: FC<{
  children: string
}> = ({ children }) => {
  const setContainerRef = useCommentMarkdownContainerRefSetter()

  return (
    <div
      className="contents"
      ref={useTypeScriptHappyCallback(
        (ref) => setContainerRef(ref?.firstChild as HTMLDivElement),
        [setContainerRef],
      )}
    >
      <Markdown
        disableParsingRawHTML
        forceBlock
        disabledTypes={disabledTypes}
        value={children}
        variant="comment"
      />
    </div>
  )
}
