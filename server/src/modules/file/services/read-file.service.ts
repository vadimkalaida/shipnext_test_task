import { Injectable } from "@nestjs/common";
import { promisify } from "util";
import * as fs from "fs";

const readFileAsync = promisify(fs.readFile);

@Injectable()
export class ReadFileService {
	async txt(filePath: string) {
		return readFileAsync(filePath, "utf-8");
	}
}
