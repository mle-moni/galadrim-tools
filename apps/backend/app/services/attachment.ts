import { MultipartFile } from '@adonisjs/core/bodyparser'
import { IImage } from '@galadrim-tools/shared'

type ImageFolder = 'restaurant' | 'codeNames' | 'restaurantReviews' | 'avatar'

export const imageAttachmentFromFile = (
  _file: MultipartFile,
  _folder: ImageFolder
): IImage | null => {
  // TODO
  return null
}
