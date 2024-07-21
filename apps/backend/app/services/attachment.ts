import { MultipartFile } from '@adonisjs/core/bodyparser'
import { cuid } from '@adonisjs/core/helpers'
import app from '@adonisjs/core/services/app'
import { IImage } from '@galadrim-tools/shared'
import fs from 'fs/promises'

type ImageFolder = 'restaurant' | 'codeNames' | 'restaurantReviews' | 'avatar'

export const imageAttachmentFromFile = async (
  file: MultipartFile,
  folder: ImageFolder
): Promise<IImage> => {
  const extname = file.extname ?? 'unknown'
  const name = `${cuid()}.${extname}`
  const fileName = `${folder}/${name}`
  const filePath = getPath(fileName)

  await file.move(filePath, {
    overwrite: true,
  })

  return {
    url: `/uploads/${fileName}`,
    name: fileName,
  }
}

const getPath = (name: string) => {
  return app.makePath('tmp/uploads', name)
}

export const imageAttachmentFromBuffer = async (
  buffer: Buffer,
  fileName: string
): Promise<IImage> => {
  const filePath = getPath(fileName)

  await fs.writeFile(filePath, buffer)

  return {
    url: `/uploads/${fileName}`,
    name: `${fileName}`,
  }
}
