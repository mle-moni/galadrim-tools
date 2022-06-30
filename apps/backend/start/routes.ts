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
    return { service: 'galadrim rooms backend' }
})

Route.post('/login', 'AuthController.login')
Route.post('/logout', 'AuthController.logout')
Route.post('/getOtp', 'AuthController.getOtp')

Route.group(() => {
    Route.resource('events', 'EventsController').apiOnly()
    Route.resource('restaurants', 'RestaurantsController').apiOnly()
    Route.get('/me', 'AuthController.me')
    Route.post('/createApiToken', 'AuthController.createApiToken')
    Route.post('/changePassword', 'AuthController.changePassword')
}).middleware('auth:web,api')

Route.get('/galadrimeurs', 'GaladrimeursController.index')
Route.get('/users', 'GaladrimeursController.users')

Route.group(() => {
    Route.get('/rooms', 'StatisticsController.favoriteRoom')
    Route.get('/time', 'StatisticsController.time')
    Route.get('/amount', 'StatisticsController.amount')
})
    .middleware('auth:web,api')
    .prefix('statistics')

Route.group(() => {
    Route.post('/createUser', 'AdminController.createUser').middleware('rights:USER_ADMIN')
    Route.get('/userRights', 'AdminController.userRights').middleware('rights:RIGHTS_ADMIN')
    Route.put('/userRights', 'AdminController.editUserRights').middleware('rights:RIGHTS_ADMIN')
})
    .middleware('auth:web,api')
    .prefix('admin')
