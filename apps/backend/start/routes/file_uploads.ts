import app from '@adonisjs/core/services/app'
import router from '@adonisjs/core/services/router'
import { normalize, sep } from 'node:path'

const PATH_TRAVERSAL_REGEX = /(?:^|[\\/])\.\.(?:[\\/]|$)/

router.get('/uploads/*', ({ request, response }) => {
  const filePath = request.param('*').join(sep)
  const normalizedPath = normalize(filePath)

  if (PATH_TRAVERSAL_REGEX.test(normalizedPath)) {
    return response.badRequest('Malformed path')
  }

  const absolutePath = app.makePath('tmp/uploads', normalizedPath)

  return response.download(absolutePath)
})
