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
    Route.resource('tags', 'tags/TagsController').apiOnly()
    Route.resource('restaurants', 'restaurants/RestaurantsController').apiOnly()
    Route.resource('notes', 'restaurantNotes/RestaurantNotesController').apiOnly()
    Route.resource('ideas', 'ideas/IdeasController').apiOnly()
    Route.post('createOrUpdateIdeaVote', 'ideas/IdeasController.createOrUpdateVote')
    Route.get('/me', 'auth/AuthController.me')
    Route.post('/createApiToken', 'auth/AuthController.createApiToken')
    Route.post('/changePassword', 'auth/AuthController.changePassword')
    Route.post('/updateProfile', 'auth/AuthController.updateProfile')
}).middleware('auth:web,api')

Route.get('/galadrimeurs', 'galadrimeurs/GaladrimeursController.index')
Route.get('/users', 'galadrimeurs/GaladrimeursController.users')

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
    Route.get('/dashboard', 'dashboard/DashboardController.index')
})
    .middleware('auth:web,api')
    .prefix('admin')
