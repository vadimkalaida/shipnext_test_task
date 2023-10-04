import { diskStorage } from "multer";
import { Express, Request } from "express";
import { ReadFileService } from "../services/read-file.service";

const returnFileMulterConfig = () => {
	const fileMethodNames = Object.getOwnPropertyNames(ReadFileService.prototype).filter(
		(propertyName) => propertyName !== "constructor"
	);
	const regexPattern = new RegExp(`\\.(${fileMethodNames.join("|")})$`);
	return {
		storage: diskStorage({
			destination: "./uploads",
			filename: (
				req: Request,
				file: Express.Multer.File,
				callback: (error: Error | null, fileName: string) => void
			) => {
				return callback(null, file.originalname);
			},
		}),
		fileFilter(req: Request, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) {
			if (!file.originalname.match(regexPattern)) {
				return callback(new Error("Only text files are allowed!"), false);
			}
			return callback(null, true);
		},
	};
};

const fileMulterConfig = returnFileMulterConfig();

export { fileMulterConfig };
