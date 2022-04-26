import redis from '@src/bin/redis';
import { Status } from '@src/config/server_config';
import Util from '@util';
import fsPromise from 'fs/promises';
import multer, { DiskStorageOptions } from 'multer';
import path from 'path';
import HttpError from './httpError';

/**
 * @param fileId 字段名
 * @param rule 规则
 * @param fileType 可选，文件类型
 */
interface FileFilterOption {
    fileId: string;
    fileType?: FileType;
    rule?: string[];
    storageAddress?: string;
}

export const UploadKeys = 'Files_Md5_Key';

type noString<T> = T extends string ? never : T;

interface Hook {
    beforeUpload (...params: Parameters<noString<NonNullable<DiskStorageOptions['destination']>>>): void;
}

type FileType = 'img';
const fileTypeMap = new Map([
    [
        'img',
        {
            rule: ['png', 'jpeg', 'bmp', 'svg', 'jpg', 'jfif', 'gif'],
            storageAddress: 'images'
        }
    ]
]);
export default class Upload {
    private uploader;

    private map!: {
        rule: string[];
        storageAddress: string;
    };

    public constructor (
        private dirPath: string | null,
        private fileFilterOption: FileFilterOption | FileFilterOption[],
        _hook?: Hook
    ) {
        this.uploader = multer({
            storage: multer.memoryStorage(),
            fileFilter: async (_req, file, cb) => {
                const extname = path.extname(file.originalname).replace(/^\./, '');

                let rule;
                if (fileFilterOption instanceof Array) {
                    const option = fileFilterOption.find((v) => v.fileId === file.fieldname);
                    if (option) {
                        if (option?.fileType) {
                            const map = fileTypeMap.get(option?.fileType);

                            if (map) {
                                this.map = map;
                            } else {
                                cb(new HttpError(Status.MISSING_PARAMS, 'File type error'));
                            }
                        }

                        if (option.rule) {
                            rule = option.rule;
                        } else {
                            rule = this.map?.rule;
                        }
                    } else {
                        cb(new HttpError(Status.MISSING_PARAMS, 'File type error'));
                    }
                } else {
                    if (file.fieldname === fileFilterOption.fileId) {
                        if (fileFilterOption?.fileType) {
                            const map = fileTypeMap.get(fileFilterOption?.fileType);

                            if (map) {
                                this.map = map;
                            } else {
                                cb(new HttpError(Status.MISSING_PARAMS, 'File type error'));
                            }
                        }

                        if (fileFilterOption.rule) {
                            rule = fileFilterOption.rule;
                        } else {
                            rule = this.map?.rule;
                        }
                    } else {
                        cb(new HttpError(Status.MISSING_PARAMS, 'File type error'));
                    }
                }
                if (rule && rule.includes(extname)) {
                    cb(null, true);
                } else {
                    cb(new HttpError(Status.MISSING_PARAMS, 'File type error'));
                }
            },
            limits: {
                // tslint:disable-next-line: no-magic-numbers
                fileSize: 5 * 1024 * 1024 // no larger than 5mb, you can change as needed.
            }
        });
    }

    public single (fieIdName: string) {
        return this.uploader.single(fieIdName);
    }

    public fields (fields: readonly multer.Field[]) {
        return this.uploader.fields(fields);
    }

    public array (fieIdName: string, count: number) {
        return this.uploader.array(fieIdName, count);
    }

    public async saveFile (file: Express.Multer.File, filename: string) {
        if (!this.dirPath) {
            throw new Error('请先传入文件目录，再保存文件');
        }
        try {
            await fsPromise.access(this.dirPath);
        } catch (e) {
            await fsPromise.mkdir(this.dirPath);
        }
        const date = Util.dateFormat(Date.now(), 'yyyy-MM-dd');
        const storageAddress = this.map.storageAddress;
        const realPath = path.join(this.dirPath, storageAddress, date);

        const url = path.join(realPath, filename + path.extname(file.originalname));
        const filePath = path.join(process.cwd(), url);
        Util.mkDirForFile(filePath);
        // const writeStream = fs.createWriteStream(url);
        // writeStream.write(file.buffer);

        // writeStream.end();
        try {
            await fsPromise.writeFile(filePath, file.buffer);
            await redis(async (client) => {
                await client.hSet(UploadKeys, filename, url);
            });
            return Util.getUrlWithHost(url);
        } catch (error) {
            throw error;
        }
    }
}
