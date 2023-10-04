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

import Env from '@ioc:Adonis/Core/Env'
import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
    return { service: 'galadrim tools backend' }
})

Route.post('/login', 'auth/AuthController.login')
Route.post('/logout', 'auth/AuthController.logout')
Route.post('/getOtp', 'auth/AuthController.getOtp')

Route.group(() => {
    Route.resource('events', 'events/EventsController').apiOnly()
    Route.get('/allEvents', 'events/EventsController.all')
    Route.get('/availableRooms', 'events/EventsController.availableRooms')
    Route.resource('tags', 'tags/TagsController').apiOnly()
    Route.resource('restaurants', 'restaurants/RestaurantsController').apiOnly()
    Route.post(
        'createOrUpdateRestaurantChoice',
        'restaurants/RestaurantsController.createOrUpdateChoice'
    )
    Route.get('/notes/mine', 'restaurantNotes/RestaurantNotesController.mine')
    Route.resource('notes', 'restaurantNotes/RestaurantNotesController').apiOnly()
    Route.resource('ideas', 'ideas/IdeasController').apiOnly()
    Route.post('createOrUpdateIdeaVote', 'ideas/IdeasController.createOrUpdateVote')
    Route.post('createIdeaComment', 'ideas/IdeasController.createComment')
    Route.get('/me', 'auth/AuthController.me')
    Route.post('/createApiToken', 'auth/AuthController.createApiToken')
    Route.post('/changePassword', 'auth/AuthController.changePassword')
    Route.post('/updateProfile', 'auth/AuthController.updateProfile')
    Route.get('/users', 'galadrimeurs/GaladrimeursController.users')

    Route.post('/updateNotificationsSettings', 'auth/AuthController.updateNotificationsSettings')
    Route.post('/readNotifications', 'auth/AuthController.readNotifications')

    Route.resource('matrices', 'matrices/MatricesController').apiOnly()

    Route.post('codeNamesGames/addRound/:id', 'codeNamesGames/CodeNamesGamesController.addRound')
    Route.resource('codeNamesGames', 'codeNamesGames/CodeNamesGamesController').apiOnly()
}).middleware('auth:web,api')

Route.group(() => {
    Route.resource('votes', 'breakVotes/BreakVotesController').apiOnly()
    Route.resource('activities', 'breakActivities/BreakActivitiesController').apiOnly()
    Route.resource('times', 'breakTimes/BreakTimesController').apiOnly()
})
    .prefix('galabreak')
    .middleware('auth:web,api')

Route.get('/galadrimeurs', 'galadrimeurs/GaladrimeursController.index')

Route.group(() => {
    Route.get('/rooms', 'statistics/StatisticsController.favoriteRoom')
    Route.get('/time', 'statistics/StatisticsController.time')
    Route.get('/amount', 'statistics/StatisticsController.amount')
})
    .middleware('auth:web,api')
    .prefix('statistics')

Route.group(() => {
    Route.post('/createUser', 'admin/AdminController.createUser').middleware('rights:USER_ADMIN')
    Route.get('/userRights', 'admin/AdminController.userRights').middleware('rights:RIGHTS_ADMIN')
    Route.put('/userRights', 'admin/AdminController.editUserRights').middleware(
        'rights:RIGHTS_ADMIN'
    )
    Route.post('/createNotification', 'admin/AdminController.createNotification').middleware(
        'rights:NOTIFICATION_ADMIN'
    )
    Route.get('/dashboard', 'dashboard/DashboardController.index')
})
    .middleware('auth:web,api')
    .prefix('admin')

Route.get('authRedirect/:target', ({ response, request }) => {
    const target = request.param('target')
    return response.redirect(`${Env.get('FRONTEND_URL')}/login?redirect=${target}`)
})

Route.group(() => {
    Route.get('tournois', 'platformerResults/PlatformerResultsController.index')
})
    .prefix('games')
    .middleware('auth:web,api')
