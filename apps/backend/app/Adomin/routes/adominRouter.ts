import router from '@adonisjs/core/services/router'
import { adominLogin } from '#app/Adomin/routes/adominLogin'
import { adominLogout } from './adominLogout.js'
import { getAdominConfig } from './getAdominConfig.js'
import { getModelConfigRoute } from './models/getModelConfig.js'
import { modelList } from './models/read/modelList.js'
import { showModel } from './models/read/showModel.js'
import { createModel } from './models/write/createModel.js'
import { deleteModel } from './models/write/deleteModel.js'
import { updateModel } from './models/write/updateModel.js'
import { getStatConfigRoute } from './stats/getStatConfig.js'

router.group(() => {
    router.group(() => {
        router.get('config/stats/:view', getStatConfigRoute)

        router.get('config', getAdominConfig)
        router.get('config/:model', getModelConfigRoute)

        router.post('crud/export/:model', modelList)
        router.get('crud/:model', modelList)
        router.get('crud/:model/:id', showModel)
        router.put('crud/:model/:id', updateModel)
        router.delete('crud/:model/:id', deleteModel)
        router.post('crud/:model', createModel)
        router.post('logout', adominLogout)
    }).middleware('auth')
    // ! please restrict this route group for only admins of your app

    router.post('login', adominLogin)
}).prefix('adomin/api')

// if you want to host your backoffice on the same domain as your backend:
// - put your adomin-frontend built files in the public folder
// - uncomment the following route
// - create and setup config/static.ts (https://docs.adonisjs.com/guides/static-assets#configuration)

// Route.get('*', ({ response }) => {
//   // n.b. import Application from '@ioc:Adonis/Core/Application'
//   const htmlPath = Application.publicPath('index.html')
//   const fileStream = fs.createReadStream(htmlPath)

//   response.type('html')

//   return response.stream(fileStream)
// })
