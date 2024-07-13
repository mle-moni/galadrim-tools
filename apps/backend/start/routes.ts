/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import { showRestaurantRewind } from '#app/Controllers/Http/restaurantRewinds/showRestaurantRewind'
import env from '#start/env'

import AuthController from '#controllers/auth/auth_controller'
import CodeNamesGamesController from '#controllers/codeNamesGames/CodeNamesGamesController'
import EventsController from '#controllers/events/EventsController'
import GaladrimeursController from '#controllers/galadrimeurs/GaladrimeursController'
import IdeasController from '#controllers/ideas/IdeasController'
import MatricesController from '#controllers/matrices/MatricesController'
import RestaurantNotesController from '#controllers/restaurant_notes/RestaurantNotesController'
import RestaurantsController from '#controllers/restaurants/RestaurantsController'
import TagsController from '#controllers/tags/TagsController'
import { middleware } from './kernel.js'

router.get('/', async () => {
  return { service: 'galadrim tools backend' }
})

router.post('/login', [AuthController, 'login'])
router.post('/logout', [AuthController, 'logout'])
router.post('/getOtp', [AuthController, 'getOtp'])

router
  .group(() => {
    router.resource('events', EventsController).apiOnly()
    router.get('/allEvents', [EventsController, 'all'])
    router.get('/availableRooms', [EventsController, 'availableRooms'])

    router.resource('tags', TagsController).apiOnly()
    router.resource('restaurants', RestaurantsController).apiOnly()
    router.post('createOrUpdateRestaurantChoice', [RestaurantsController, 'createOrUpdateChoice'])

    router.get('/notes/mine', [RestaurantNotesController, 'mine'])
    router.resource('notes', RestaurantNotesController).apiOnly()

    router.resource('ideas', IdeasController).apiOnly()
    router.post('createOrUpdateIdeaVote', [IdeasController, 'createOrUpdateVote'])
    router.post('createIdeaComment', [IdeasController, 'createComment'])

    router.get('/me', [AuthController, 'me'])
    router.post('/createApiToken', [AuthController, 'createApiToken'])
    router.post('/changePassword', [AuthController, 'changePassword'])
    router.post('/updateProfile', [AuthController, 'updateProfile'])
    router.post('/updateTheme', [AuthController, 'updateTheme'])

    router.get('/users', [GaladrimeursController, 'users'])

    router.post('/updateNotificationsSettings', [AuthController, 'updateNotificationsSettings'])
    router.post('/readNotifications', [AuthController, 'readNotifications'])

    router.resource('matrices', MatricesController).apiOnly()

    router.post('codeNamesGames/addRound/:id', [CodeNamesGamesController, 'addRound'])
    router.resource('codeNamesGames', CodeNamesGamesController).apiOnly()

    router
      .resource(
        'restaurants/:restaurantId/reviews',
        'restaurantReviews/RestaurantReviewsController'
      )
      .apiOnly()
    router.get('rewind/:id?', showRestaurantRewind)
    router.resource('bugConnexions', 'bugConnexions/BugConnexionsController').apiOnly()
    router.get('/caddyLogs/:id', 'logs/LogsController.showCaddyLogs')
    router.get('/atopLogs/:id', 'logs/LogsController.showAtopLogs')
  })
  .use(middleware.auth())

router.post('/caddyLogs', 'logs/LogsController.storeCaddyLogs')
router.post('/atopLogs', 'logs/LogsController.storeAtopLogs')

router
  .group(() => {
    router.resource('votes', 'breakVotes/BreakVotesController').apiOnly()
    router.resource('activities', 'breakActivities/BreakActivitiesController').apiOnly()
    router.resource('times', 'breakTimes/BreakTimesController').apiOnly()
  })
  .prefix('galabreak')
  .use(middleware.auth())

router.get('/galadrimeurs', 'galadrimeurs/GaladrimeursController.index')

router
  .group(() => {
    router.get('/rooms', 'statistics/StatisticsController.favoriteRoom')
    router.get('/time', 'statistics/StatisticsController.time')
    router.get('/amount', 'statistics/StatisticsController.amount')
  })
  .use(middleware.auth())
  .prefix('statistics')

router
  .group(() => {
    router
      .post('/createUser', 'admin/AdminController.createUser')
      .use(middleware.rights(['USER_ADMIN']))
    router
      .get('/userRights', 'admin/AdminController.userRights')
      .use(middleware.rights(['RIGHTS_ADMIN']))
    router
      .put('/userRights', 'admin/AdminController.editUserRights')
      .use(middleware.rights(['RIGHTS_ADMIN']))
    router
      .post('/createNotification', 'admin/AdminController.createNotification')
      .use(middleware.rights(['NOTIFICATION_ADMIN']))
    router.get('/dashboard', 'dashboard/DashboardController.index')
  })
  .use(middleware.auth())
  .prefix('admin')

router.get('authRedirect/:target', ({ response, request }) => {
  const target = request.param('target')
  return response.redirect(`${env.get('FRONTEND_URL')}/login?redirect=${target}`)
})

router
  .group(() => {
    router.get('tournois', 'platformerResults/PlatformerResultsController.index')
  })
  .prefix('games')
  .use(middleware.auth())
