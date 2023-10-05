import { Module } from "@nestjs/common";
import { FileService } from "./services/file.service";
import { ReadFileService } from "./services/read-file.service";
import { ParseService } from "../../global-services/parse.service";
import { FileController } from "./file.controller";

@Module({
	controllers: [FileController],
	providers: [FileService, ReadFileService, ParseService],
})
export class FileModule {}
