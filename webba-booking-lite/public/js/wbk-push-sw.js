self.addEventListener('install', (event) => {
    self.skipWaiting()
})

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim())
})

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting()
    }
})

self.addEventListener('push', (event) => {
    event.waitUntil(handlePushEvent(event))
})

const handlePushEvent = async (event) => {
    let data = {}
    try {
        data = event.data ? event.data.json() : {}
    } catch (error) {
        data = { body: event.data ? event.data.text() : '' }
    }

    const title = data.title || 'Webba Booking'
    const options = {
        body: data.body || '',
        data: {
            url: data.url || '/',
        },
        renotify: true,
        tag: 'wbk-push',
    }

    if (data.icon) {
        options.icon = data.icon
    }

    const clientsList = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
    })
    const payload = {
        type: 'wbk-push-received',
        title,
        body: options.body,
    }
    clientsList.forEach((client) => {
        client.postMessage(payload)
    })
    try {
        const channel = new BroadcastChannel('wbk-push')
        channel.postMessage(payload)
        channel.close()
    } catch (error) {
        // BroadcastChannel is unavailable in some browsers.
    }

    try {
        await self.registration.showNotification(title, options)
    } catch (error) {
        await self.registration.showNotification(title, { body: options.body })
    }
}

self.addEventListener('notificationclick', (event) => {
    event.notification.close()
    const url = event.notification.data && event.notification.data.url
        ? event.notification.data.url
        : '/'

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
            for (let i = 0; i < clients.length; i++) {
                const client = clients[i]
                if (client.url === url && 'focus' in client) {
                    return client.focus()
                }
            }
            if (self.clients.openWindow) {
                return self.clients.openWindow(url)
            }
            return undefined
        })
    )
})
