var serviceWorkerRegistration = self.registration
var serviceWorkerClients = self.clients

self.addEventListener('install', function (event) {
  console.debug('Trying to install serviceWorker...')

  event.waitUntil(
    console.debug('serviceWorker is installed!')
  )
})

self.addEventListener('activate', function (event) {
  console.debug('Trying to activate serviceWorker...')

  event.waitUntil(
    console.debug('serviceWorker is activated!')
  )
})

self.addEventListener('push', function (event) {
  console.debug('Trying to handle push event with serviceWorker...', event)

  if (! event.data) {
    console.error(new Error('Push event without data field can not be handled!'))
    return
  }

  var eventData = event.data.json()
  console.debug('Constructed eventData', eventData)

  var notification = Object.assign(
    {},
    eventData.notification,
    {
      data: Object.assign(
        {},
        eventData.data,
        {
          onPushEventStatUrl: '/mailer/statistics/push/opened/' + eventData.data.uuid,
          onNotificationClickStatUrl: '/mailer/statistics/push/delivered/' + eventData.data.uuid
        }
      )
    },
  )
  console.debug('Constructed notification', notification)

  if (!! eventData.data.icon_url) {
    notification.icon = eventData.data.icon_url
  } else {
    notification.icon = '/web-push-icon-default.png'
  }

  if (!! eventData.data.big_icon_url) {
    notification.image = eventData.data.big_icon_url
  }

  if (typeof notification.requireInteraction === 'undefined' && typeof eventData.data.require_interaction !== 'undefined') {
    notification.requireInteraction = eventData.data.require_interaction
  } else {
    notification.requireInteraction = true
  }

  handleNotificationStatistics('notificationPushed', notification)

  event.waitUntil(
    serviceWorkerRegistration.showNotification(eventData.notification.title, notification)
  )
})

self.addEventListener('notificationclick', function (event) {
  console.debug('Trying to handle notificationclick event with serviceWorker...', event)

  handleNotificationStatistics('notificationClicked', event.notification)

  event.preventDefault()
  event.notification.close()

  event.waitUntil(
    clickActionUrlHandler(event.notification.data.action_url)
  )
})

self.addEventListener('notificationclose', function (event) {
  console.debug('Trying to handle notificationclose event with serviceWorker...', event)
})

function clickActionUrlHandler(url) {
  console.debug('clickActionUrlHandler', url)

  if (! url) {
    return
  }

  return serviceWorkerClients.matchAll({
    includeUncontrolled: true,
    type: 'window',
  }).then(function (clients) {
    console.debug('clickActionUrlHandler clients', clients)

    for (i = 0; i < clients.length; i++) {
      if (clients[i].url === url) {

        console.debug('clickActionUrlHandler client found', clients[i])

        clients[i].focus()
        return
      }
    }

    console.debug('clickActionUrlHandler open window', url)
    serviceWorkerClients.openWindow(url)
  })
}

function handleNotificationStatistics(eventName, notification) {
  console.debug('handleNotificationStatistics', eventName, notification)

  switch (true) {
    case eventName === 'notificationPushed' && !! notification.data.onPushEventStatUrl:
      makeRequest(notification.data.onPushEventStatUrl)
      return
    case eventName === 'notificationClicked' && !! notification.data.onNotificationClickStatUrl:
      makeRequest(notification.data.onNotificationClickStatUrl)
      return
  }
}

function makeRequest (url) {
  fetch(new Request(url, { mode: 'cors' }))
    .then(function (response) {
      if (! response.ok) {
        return Promise.reject(new Error(response.statusText))
      }
    })
    .then(function () {
      console.debug('makeRequest success', url);
    }).catch(function (error) {
      console.error('makeRequest error', url, error);
    })
}
