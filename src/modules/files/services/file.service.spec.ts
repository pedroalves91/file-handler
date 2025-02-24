import { Test, TestingModule } from '@nestjs/testing';
import { FileService } from './file.service';
import { AppLogger } from '../../../shared/logger/app.logger';
import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

jest.mock('fs/promises', () => ({
  writeFile: jest.fn(),
  mkdir: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

jest.mock('p-limit', () => () => (fn: () => Promise<any>) => fn());

describe('FileService', () => {
  let fileService: FileService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [FileService, AppLogger],
    }).compile();

    fileService = module.get<FileService>(FileService);
    module.get<AppLogger>(AppLogger);
  });

  it('should be defined', () => {
    expect(fileService).toBeDefined();
  });

  it('should create uploads directory on initialization', () => {
    expect(fs.mkdir).toHaveBeenCalledWith(expect.any(String), {
      recursive: true,
    });
  });

  it('should successfully save a file with retry logic', async () => {
    const file = {
      buffer: Buffer.from('dummy file content'),
      originalname: 'test.csv',
      size: 250000000, // 250MB
    } as Express.Multer.File;

    const requestId = 'test-request-id';
    const filePath =
      '/Users/pedro/Desktop/My Code/file-handler/uploads/test-uuid-test.csv';

    (uuidv4 as jest.Mock).mockReturnValue('test-uuid');
    (fs.writeFile as jest.Mock).mockResolvedValueOnce(undefined);

    const result = await fileService.saveFile(file, requestId);

    expect(result).toBe(filePath);
    expect(fs.writeFile).toHaveBeenCalledTimes(1);
  });

  it('should retry saving the file on failure', async () => {
    const file = {
      buffer: Buffer.from('dummy file content'),
      originalname: 'test.csv',
      size: 250000000, // 250MB
    } as Express.Multer.File;

    const requestId = 'test-request-id';
    const filePath =
      '/Users/pedro/Desktop/My Code/file-handler/uploads/test-uuid-test.csv';

    (uuidv4 as jest.Mock).mockReturnValue('test-uuid');
    (fs.writeFile as jest.Mock)
      .mockRejectedValueOnce(new Error('File save failed'))
      .mockResolvedValueOnce(undefined);

    const result = await fileService.saveFile(file, requestId);

    expect(result).toBe(filePath);
    expect(fs.writeFile).toHaveBeenCalledTimes(2);
  });

  it('should throw BadRequestException if file is invalid', async () => {
    const file = {} as Express.Multer.File;
    const requestId = 'test-request-id';

    await expect(fileService.saveFile(file, requestId)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should process multiple files', async () => {
    const files = [
      {
        buffer: Buffer.from('dummy file content 1'),
        originalname: 'test1.csv',
        size: 250000000, // 250MB
      },
      {
        buffer: Buffer.from('dummy file content 2'),
        originalname: 'test2.csv',
        size: 250000000, // 250MB
      },
    ] as Express.Multer.File[];

    const requestId = 'test-request-id';
    const filePath1 =
      '/Users/pedro/Desktop/My Code/file-handler/uploads/test-uuid-1-test1.csv';
    const filePath2 =
      '/Users/pedro/Desktop/My Code/file-handler/uploads/test-uuid-2-test2.csv';

    (uuidv4 as jest.Mock)
      .mockReturnValueOnce('test-uuid-1')
      .mockReturnValueOnce('test-uuid-2');
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

    const result = await fileService.processFiles(files, requestId);

    expect(result).toEqual([filePath1, filePath2]);
    expect(fs.writeFile).toHaveBeenCalledTimes(2);
  });

  it('should throw BadRequestException if no files are uploaded', async () => {
    const files: Express.Multer.File[] = [];
    const requestId = 'test-request-id';

    await expect(fileService.processFiles(files, requestId)).rejects.toThrow(
      BadRequestException,
    );
  });
});
