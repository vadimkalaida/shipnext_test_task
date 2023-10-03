import { diskStorage } from "multer";
import { Express, Request } from "express";

export const TextFileMulterConfig = {
	storage: diskStorage({
		destination: "./uploads",
		filename: (req: Request, file: Express.Multer.File, callback: (error: Error | null, fileName: string) => void) => {
			return callback(null, file.originalname);
		},
	}),
	fileFilter(req: Request, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) {
		if (!file.originalname.match(/\.(txt)$/)) {
			return callback(new Error("Only text files are allowed!"), false);
		}
		return callback(null, true);
	},
};
