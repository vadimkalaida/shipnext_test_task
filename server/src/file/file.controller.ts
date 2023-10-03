import { Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Express } from "express";
import { FileService } from "./services/file.service";
import { TextFileMulterConfig } from "./configs/multer.config";

@Controller("file")
export class FileController {
	constructor(private readonly fileService: FileService) {}

	@Post("upload")
	@UseInterceptors(FileInterceptor("file", TextFileMulterConfig))
	uploadFile(@UploadedFile() file: Express.Multer.File) {
		return this.fileService.uploadFile(file.path);
	}
}
