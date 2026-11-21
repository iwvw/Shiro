import type { PageModel } from '@mx-space/api-client'

import { apiClient } from '~/lib/request'
import { dataOf } from '~/types/api-compat'

import { defineQuery } from '../helper'

export const page = {
  bySlug: (slug: string) =>
    defineQuery({
      queryKey: ['page', slug],

      queryFn: async ({ queryKey }) => {
        const [, slug] = queryKey

        const data = await apiClient.page.getBySlug(slug, {
          prefer: 'lexical',
        })

        return dataOf<PageModel>(data)
      },
    }),
}
