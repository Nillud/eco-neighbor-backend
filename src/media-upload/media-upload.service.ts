import { Injectable } from '@nestjs/common'
import type { IUploadResponse } from './upload-response.types'
import { ensureDir, writeFile } from 'fs-extra'
import { path } from 'app-root-path'
import * as iconv from 'iconv-lite'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class MediaUploadService {
	constructor() {}

	async uploadImage(file: Express.Multer.File, folder: string = 'default'): Promise<IUploadResponse> {
		const uploadFolder = `${path}/uploads/${folder}`
		await ensureDir(uploadFolder)

		const original = iconv.decode(
			Buffer.from(file.originalname, 'binary'),
			'utf-8'
		)
		const safeName = original.replace(/[^\w.-]+/g, '-').toLowerCase()
		const name = `${uuidv4().slice(0, 8)}-${safeName}`

		await writeFile(`${uploadFolder}/${name}`, file.buffer)

		const url = `/uploads/${folder}/${name}`

		return { url, name }
	}
}
