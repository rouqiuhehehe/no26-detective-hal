import redis from '@src/bin/redis';
import { Controller, Get, Post } from '@src/descriptor/controller';
import Middleware from '@src/descriptor/middleware';
import Validate from '@src/descriptor/validate';
import { UploadKeys } from '@src/models/upload';
import Joi from 'joi';
import path from 'path';
import dictionary from '.';
import Util from '@util';

@Controller('/download')
export default class extends dictionary {
    @Validate({
        filename: Joi.string().required()
    })
    @Middleware()
    @Post('/')
    public async downloadFile(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
        let { filename } = req.body;

        const extname = path.extname(filename);

        filename = filename.replace(extname, '');

        try {
            const filePath = await this.searchFile(filename);
            res.download(filePath);
        } catch (error) {
            next(error);
        }
    }

    @Validate({
        filename: Joi.string().required()
    })
    @Middleware()
    @Get('/')
    public async downloadFileGet(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
        let filename = req.query.filename as string;

        const extname = path.extname(filename);

        filename = filename.replace(extname, '');
        try {
            // const filePath = await Util.findFilesRecursively(filename as string, path.join(process.cwd(), 'uploads'));
            const filePath = await this.searchFile(filename);
            res.download(filePath);
        } catch (error) {
            next(error);
        }
    }

    private searchFile(filename: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            await redis(async (client) => {
                const url = await client.hGet(UploadKeys, filename);

                if (url) {
                    resolve(path.join(process.cwd(), url));
                } else {
                    try {
                        const filePath = await Util.findFilesRecursively(
                            filename as string,
                            path.join(process.cwd(), 'uploads')
                        );
                        resolve(filePath);
                    } catch (e) {
                        reject(e);
                    }
                }
            });
        });
    }
}
