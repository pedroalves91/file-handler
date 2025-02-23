import { BadRequestException, Injectable } from '@nestjs/common';
import * as path from 'path';
import pLimit from 'p-limit';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
const MAX_CONCURRENT_JOBS = 5; // Limit concurrent file processing
const limit = pLimit(MAX_CONCURRENT_JOBS);

@Injectable()
export class FileService {
  constructor() {
    // Ensure uploads directory exists
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    if (!file || !file.originalname) {
      throw new BadRequestException('Invalid file uploaded');
    }

    // Generate a safe file path
    const safeFilename = `${uuidv4()}-${file.originalname.replace(/\s+/g, '_')}`;
    const filePath = path.join(UPLOADS_DIR, safeFilename);

    return new Promise((resolve, reject) => {
      const handleError = () =>
        reject(new BadRequestException('Error saving file'));

      if (file.buffer) {
        fs.writeFile(filePath, file.buffer, (err) => {
          if (err) handleError();
          else resolve(filePath);
        });
        return;
      }

      reject(new BadRequestException('No valid file data found'));
    });
  }

  async processFiles(files: Express.Multer.File[]): Promise<void> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const fileProcessingPromises = files.map((file) =>
      limit(() => this.saveFile(file)),
    );

    const results = await Promise.all(fileProcessingPromises);

    const successfulFiles = results.filter((result) => result !== null);
    console.log(successfulFiles);
  }
}
