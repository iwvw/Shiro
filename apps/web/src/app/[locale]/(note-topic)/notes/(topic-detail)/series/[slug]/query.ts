import type { TopicModel } from '@mx-space/api-client'

import { apiClient } from '~/lib/request'
import { defineQuery } from '~/queries/helper'
import { dataOf } from '~/types/api-compat'

export const getTopicQuery = (topicSlug: string) =>
  defineQuery({
    queryKey: ['topic', topicSlug],
    queryFn: async ({ queryKey }) => {
      const [_, slug] = queryKey
      return dataOf<TopicModel>(await apiClient.topic.getTopicBySlug(slug))
    },
  })
