import type { AggregateRoot } from '@mx-space/api-client'
import { isServer } from '@tanstack/react-query'

import { apiClient } from '~/lib/request'
import { dataOf } from '~/types/api-compat'

import { defineQuery } from '../helper'

export const aggregation = {
  root: () =>
    defineQuery({
      queryKey: ['aggregation'],
      queryFn: async () =>
        apiClient.aggregate
          .getAggregateData('shiro')
          .then((res) =>
            dataOf<AggregateRoot & { theme: AppThemeConfig }>(res),
          ),
      gcTime: 1000 * 60 * 10,
      staleTime: isServer ? 1000 * 60 * 10 : undefined,
    }),
}
