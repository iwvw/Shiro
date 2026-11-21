import { simpleCamelcaseKeys as camelcaseKeys } from '@mx-space/api-client'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

import { getSocketWebSessionId } from '~/atoms/hooks/socket'
import { setSocketIsConnect } from '~/atoms/socket'
import { GATEWAY_URL } from '~/constants/env'
import { SocketConnectedEvent, SocketDisconnectedEvent } from '~/events'
import { isDev, isServerSide } from '~/lib/env'
import type { EventTypes, SocketEmitEnum } from '~/types/events'

import { eventHandler } from './handler'

interface WorkerSocket {
  sid: string
}

type SocketWorkerTransport = {
  postMessage: (message: any) => void
  start: () => void
  onmessage: MessagePort['onmessage']
  onmessageerror: MessagePort['onmessageerror']
}

class SocketWorker {
  // @ts-expect-error
  private router: AppRouterInstance

  private socket: WorkerSocket | null = null

  worker: SocketWorkerTransport | null = null

  constructor() {
    if (isServerSide) return

    // NOTE: 必须把 `new URL('./io.worker.ts', import.meta.url)` 内联在 Worker
    // 构造函数里,bundler(webpack)才会把它当作 worker 入口打成 JS chunk。
    // 若先赋值给变量再传入,会被当作普通静态资源产出 `.ts`(浏览器拒绝执行)。
    const createWorker = (): SocketWorkerTransport => {
      const w = new Worker(new URL('io.worker.ts', import.meta.url), {
        type: 'module',
      })
      return {
        postMessage: (message) => w.postMessage(message),
        start: () => {},
        get onmessage() {
          return w.onmessage as any
        },
        set onmessage(value) {
          w.onmessage = value as any
        },
        get onmessageerror() {
          return w.onmessageerror as any
        },
        set onmessageerror(value) {
          w.onmessageerror = value as any
        },
      }
    }

    const createSharedWorker = (): SocketWorkerTransport => {
      const sw = new SharedWorker(new URL('io.worker.ts', import.meta.url), {
        name: 'shiro-ws-worker',
        type: 'module',
      })

      return {
        postMessage: (message) => sw.port.postMessage(message),
        start: () => sw.port.start(),
        get onmessage() {
          return sw.port.onmessage
        },
        set onmessage(value) {
          sw.port.onmessage = value
        },
        get onmessageerror() {
          return sw.port.onmessageerror
        },
        set onmessageerror(value) {
          sw.port.onmessageerror = value
        },
      }
    }

    let worker: SocketWorkerTransport
    if ('SharedWorker' in window) {
      try {
        worker = createSharedWorker()
      } catch (err) {
        console.warn(
          '[ws worker] SharedWorker init failed, fallback to Worker',
          err,
        )
        worker = createWorker()
      }
    } else {
      worker = createWorker()
    }

    this.prepare(worker)
    this.worker = worker
  }

  async getSid() {
    return this.socket?.sid
  }

  setRouter(router: AppRouterInstance) {
    this.router = router
  }

  private setSid(sid: string) {
    this.socket = {
      ...this.socket,
      sid,
    }
  }
  bindMessageHandler = (worker: SocketWorkerTransport) => {
    worker.onmessage = (event: MessageEvent) => {
      const { data } = event
      const { type, payload } = data

      switch (type) {
        case 'ping': {
          worker?.postMessage({
            type: 'pong',
          })
          console.info('[ws worker] pong')
          break
        }
        case 'connect': {
          window.dispatchEvent(new SocketConnectedEvent())
          setSocketIsConnect(true)

          const sid = payload
          this.setSid(sid)
          break
        }
        case 'disconnect': {
          window.dispatchEvent(new SocketDisconnectedEvent())
          setSocketIsConnect(false)
          break
        }
        case 'sid': {
          const sid = payload
          this.setSid(sid)
          break
        }
        case 'message': {
          const typedPayload = payload as string | Record<'type' | 'data', any>
          if (typeof typedPayload !== 'string') {
            return this.handleEvent(
              typedPayload.type,
              camelcaseKeys(typedPayload.data),
            )
          }
          const { data, type } = JSON.parse(typedPayload) as {
            data: any
            type: EventTypes
          }
          this.handleEvent(type, camelcaseKeys(data))
        }
      }
    }
  }

  prepare(worker: SocketWorkerTransport, lang?: string) {
    const gatewayUrlWithoutTrailingSlash = GATEWAY_URL.replace(/\/$/, '')
    this.bindMessageHandler(worker)
    worker.postMessage({
      type: 'config',

      payload: {
        url: `${gatewayUrlWithoutTrailingSlash}/web`,
        socket_session_id: getSocketWebSessionId(),
        lang,
      },
    })

    worker.start()

    worker.postMessage({
      type: 'init',
    })
  }
  handleEvent(type: EventTypes, data: any) {
    if (isDev) {
      console.info(data)
    }

    window.dispatchEvent(new CustomEvent(type, { detail: data }))

    eventHandler(type, data, this.router)
  }

  emit(event: SocketEmitEnum, payload: any) {
    this.worker?.postMessage({
      type: 'emit',
      payload: { type: event, payload },
    })
  }

  reconnect() {
    this.worker?.postMessage({
      type: 'reconnect',
    })
  }

  static shared = new SocketWorker()
}

export const socketWorker = SocketWorker.shared
export type TSocketClient = SocketWorker
