import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as path from 'path';
import pLimit from 'p-limit';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
const MAX_CONCURRENT_JOBS = 5; // Limit concurrent file processing
const limit = pLimit(MAX_CONCURRENT_JOBS);

@Injectable()
export class FileService {
  constructor() {
    fs.mkdir(UPLOADS_DIR, { recursive: true }).catch(
      (err: NodeJS.ErrnoException) => {
        throw new InternalServerErrorException(
          `Failed to create uploads directory: ${err.message}`,
        );
      },
    );
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    if (!file?.buffer || !file.originalname) {
      throw new BadRequestException('Invalid file uploaded');
    }

    const safeFilename = `${uuidv4()}-${file.originalname.replace(/\s+/g, '_')}`;
    const filePath = path.join(UPLOADS_DIR, safeFilename);

    try {
      await fs.writeFile(filePath, file.buffer);
      return filePath;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(`Failed to save file: ${error.message}`);
      }
      throw new BadRequestException('Failed to save file: Unknown error');
    }
  }

  async processFiles(files: Express.Multer.File[]): Promise<string[]> {
    if (!files?.length) {
      throw new BadRequestException('No files uploaded');
    }

    try {
      return await Promise.all(
        files.map((file) => limit(() => this.saveFile(file))),
      );
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(
          `Failed to process files: ${error.message}`,
        );
      }
      throw new BadRequestException('Failed to process files: Unknown error');
    }
  }
}
