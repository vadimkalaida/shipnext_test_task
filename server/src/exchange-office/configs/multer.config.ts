import { Express, Request } from "express";
import { FileService } from "../services/file.service";

const NOT_FILE_PROPERTY_NAMES = ["constructor", "uploadFile"];

const returnFileMulterConfig = () => {
	const fileMethodNames = Object.getOwnPropertyNames(FileService.prototype).filter(
		(propertyName) => !NOT_FILE_PROPERTY_NAMES.includes(propertyName)
	);
	const regexPattern = new RegExp(`\\.(${fileMethodNames.join("|")})$`);
	return {
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
