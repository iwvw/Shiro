import { simpleCamelcaseKeys } from '@mx-space/api-client'
import { useQuery } from '@tanstack/react-query'
import { nanoid } from 'nanoid'
import { useEffect } from 'react'

import { fetchAppUrl } from '~/atoms'
import { setIsOwnerLogged } from '~/atoms/hooks/owner'
import { setSessionReader } from '~/atoms/hooks/reader'
import type { authClient } from '~/lib/authjs'
import { apiClient } from '~/lib/request'
import { dataOf } from '~/types/api-compat'

type AdapterUser = typeof authClient.$Infer.Session
export const AuthSessionProvider: Component = ({ children }) => {
  const { data: session } = useQuery({
    queryKey: ['session'],
    refetchOnMount: 'always',
    queryFn: () =>
      apiClient.proxy.auth.session.get<AdapterUser>({
        params: {
          r: nanoid(),
        },
      }),
  })
  useEffect(() => {
    // 后端 v3 响应统一包在 { data } 信封里
    const payload = session ? dataOf<any>(session) : null
    if (!payload) {
      setIsOwnerLogged(false)
      setSessionReader(null)
      return
    }
    const transformedData = simpleCamelcaseKeys(payload)

    setSessionReader(transformedData)
    if (transformedData.role === 'owner') {
      setIsOwnerLogged(true)
      fetchAppUrl()
    }
  }, [session])
  return children
}
