'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'

import { clsxm } from '~/lib/helper'

export type LoadingProps = {
  loadingText?: string
  useDefaultLoadingText?: boolean
}

export const Loading: Component<LoadingProps> = ({
  loadingText,
  className,
  useDefaultLoadingText = false,
}) => {
  const t = useTranslations('common')
  const defaultLoadingTexts = useMemo(() => {
    const raw = t.raw('loading_default') as unknown
    return Array.isArray(raw) ? (raw as string[]) : [raw as string]
  }, [t])
  // 服务端与首次客户端渲染都用第 0 条,避免 hydration 不一致
  const [textIndex, setTextIndex] = useState(0)
  useEffect(() => {
    if (defaultLoadingTexts.length > 1) {
      setTextIndex(Math.floor(Math.random() * defaultLoadingTexts.length))
    }
  }, [defaultLoadingTexts.length])
  const defaultLoadingText = defaultLoadingTexts[textIndex]
  const nextLoadingText = useDefaultLoadingText
    ? defaultLoadingText
    : loadingText
  return (
    <div
      data-hide-print
      className={clsxm('my-20 flex flex-col center', className)}
    >
      <span className="loading loading-ball loading-lg" />
      {!!nextLoadingText && (
        <span className="mt-6 block">{nextLoadingText}</span>
      )}
    </div>
  )
}

export const FullPageLoading = () => (
  <Loading useDefaultLoadingText className="h-[calc(100vh-6.5rem-10rem)]" />
)
