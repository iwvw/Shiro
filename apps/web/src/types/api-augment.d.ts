import '@mx-space/api-client'

declare module '@mx-space/api-client' {
  interface PostModelMarkdown {
    allowComment?: boolean
  }
  interface PostModelLexical {
    allowComment?: boolean
  }
  interface PageModelMarkdown {
    allowComment?: boolean
  }
  interface PageModelLexical {
    allowComment?: boolean
  }
  interface NoteModel {
    allowComment?: boolean
  }
}
