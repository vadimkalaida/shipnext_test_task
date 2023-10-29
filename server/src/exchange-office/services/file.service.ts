import { Injectable } from "@nestjs/common";
import { extname } from "path";
import { Express } from "express";

@Injectable()
export class FileService {
	constructor() {}

	async uploadFile(file: Express.Multer.File): Promise<string> {
		const fileExtension = extname(file.originalname).replace(".", "");
		return this[fileExtension](file.buffer);
	}

	async txt(buffer: Buffer): Promise<string> {
		return buffer.toString("utf-8");
	}
}
