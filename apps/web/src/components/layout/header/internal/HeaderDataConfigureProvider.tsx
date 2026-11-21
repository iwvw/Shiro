'use client'

import type { PageModel } from '@mx-space/api-client'
import { useQuery } from '@tanstack/react-query'
import { createContext, use, useEffect, useMemo, useState } from 'react'

import { apiClient } from '~/lib/request'
import { useAppConfigSelector } from '~/providers/root/aggregation-data-provider'

import type { IHeaderMenu } from '../config'
import { headerMenuConfig as baseHeaderMenuConfig } from '../config'

const HeaderMenuConfigContext = createContext({
  config: baseHeaderMenuConfig,
})

export const useHeaderConfig = () => use(HeaderMenuConfigContext)
const cloneHeaderMenuConfig = (items: IHeaderMenu[]): IHeaderMenu[] =>
  items.map((item) => ({
    ...item,
    icon: item.icon,
    titleKey: item.titleKey,
    search: item.search ? { ...item.search } : undefined,
    exclude: item.exclude ? [...item.exclude] : undefined,
    subMenu: item.subMenu
      ? cloneHeaderMenuConfig(item.subMenu as IHeaderMenu[])
      : undefined,
  }))

export const HeaderDataConfigureProvider: Component = ({ children }) => {
  const { data: pageData } = useQuery({
    queryKey: ['page-meta-list'],
    queryFn: async () => (await apiClient.page.getList(1, 100)).data,
  })
  const pageMeta = useMemo(
    () =>
      pageData
        ? ([...pageData] as PageModel[]).sort(
            (a, b) => (a.order ?? 0) - (b.order ?? 0),
          )
        : undefined,
    [pageData],
  )
  const postListViewMode = useAppConfigSelector(
    (appConfig) => appConfig.module?.posts?.mode,
  )

  const [headerMenuConfig, setHeaderMenuConfig] = useState(() =>
    cloneHeaderMenuConfig(baseHeaderMenuConfig),
  )

  useEffect(() => {
    if (!pageMeta) return
    const nextMenuConfig = cloneHeaderMenuConfig(baseHeaderMenuConfig)
    if (pageMeta) {
      const homeIndex = nextMenuConfig.findIndex((item) => item.type === 'Home')
      if (homeIndex !== -1) {
        nextMenuConfig[homeIndex].subMenu = []
        for (const page of pageMeta) {
          nextMenuConfig[homeIndex].subMenu!.push({
            path: `/${page.slug}`,
            title: page.title,
          })
        }
      }
    }

    setHeaderMenuConfig(nextMenuConfig)
  }, [pageMeta])

  useEffect(() => {
    setHeaderMenuConfig((config) => {
      const postIndex = config.findIndex((item) => item.type === 'Post')

      if (postIndex === -1 || !postListViewMode) {
        return config
      }

      return config.map((item, index) => {
        if (index !== postIndex) return item
        return {
          ...item,
          search: {
            ...item.search,
            view_mode: postListViewMode,
          },
        }
      })
    })
  }, [postListViewMode])

  return (
    <HeaderMenuConfigContext
      value={useMemo(() => ({ config: headerMenuConfig }), [headerMenuConfig])}
    >
      {children}
    </HeaderMenuConfigContext>
  )
}
