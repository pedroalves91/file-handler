import {
  BadRequestException,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileService } from '../services/file.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { RequestId } from '../../../shared/decorators/request-id.decorator';
import { FileUpload } from '../interfaces/file-upload.interface';

@Controller('/files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        if (
          !file.mimetype.includes('csv') &&
          !file.originalname.endsWith('.csv')
        ) {
          return cb(
            new BadRequestException('Only CSV files are allowed!'),
            false,
          );
        }
        cb(null, true);
      },
      limits: {
        fileSize: 250 * 1024 * 1024, // 250MB max file size
      },
    }),
  )
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @RequestId() requestId: string,
  ): Promise<FileUpload> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded.');
    }

    const savedFilePaths = await this.fileService.processFiles(
      files,
      requestId,
    );

    return {
      message: 'Files uploaded and processed successfully',
      filenames: files.map((file) => file.originalname),
      paths: savedFilePaths,
    };
  }
}
