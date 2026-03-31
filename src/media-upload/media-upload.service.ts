/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common'
import type { IUploadResponse } from './upload-response.types'
import { ensureDir, writeFile } from 'fs-extra'
import { path } from 'app-root-path'
import * as iconv from 'iconv-lite'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class MediaUploadService {
	constructor() {}

	async saveAvatar(file: Express.Multer.File): Promise<IUploadResponse> {
		const folder = 'avatars'
		const uploadFolder = `${path}/uploads/${folder}`
		await ensureDir(uploadFolder)

		const original = iconv.decode(
			Buffer.from(file.originalname, 'binary'),
			'utf-8'
		)
		const safeName = original.replace(/[^\w.-]+/g, '-').toLowerCase()
		const name = `${uuidv4().slice(0, 5)}-${safeName}`

		await writeFile(`${uploadFolder}/${name}`, file.buffer)

		const url = `/uploads/${folder}/${name}`

		return { url, name }
	}
}
