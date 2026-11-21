import type { PageModel } from '@mx-space/api-client'
import { cache } from 'react'

import { attachServerFetch } from '~/lib/attach-fetch'
import { apiClient } from '~/lib/request'
import { requestErrorHandler } from '~/lib/request.server'
import { dataOf } from '~/types/api-compat'

export interface PageParams extends LocaleParams {
  slug: string
}

export const getData = cache(async (slug: string) => {
  await attachServerFetch()
  const data = await apiClient.page
    .getBySlug(slug, { prefer: 'lexical' })
    .catch(requestErrorHandler)
  return dataOf<PageModel>(data)
})
