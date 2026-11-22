import type { Locale } from '~/i18n/config'
import { redirect } from '~/i18n/navigation'
import { apiClient } from '~/lib/request'
import { definePrerenderPage } from '~/lib/request.server'
import { dataOf } from '~/types/api-compat'

export default definePrerenderPage<{
  category: string
  locale: Locale
}>()({
  fetcher({ category }) {
    // NOTE: getDataFromResponse 被关闭了信封解包,getFullUrl 返回的是 { data: { path } },
    // 必须用 dataOf 取内层,否则 data.path 为 undefined → 跳到 /postsundefined
    return apiClient.post
      .getFullUrl(category)
      .then((res) => dataOf<{ path: string }>(res))
  },
  async Component({ data, params }) {
    const { locale } = params
    redirect({ href: `/posts${data.path}`, locale })

    return (
      <div>
        正在重定向到 <pre>{`/posts${data.path}`}</pre>
      </div>
    )
  },
})
