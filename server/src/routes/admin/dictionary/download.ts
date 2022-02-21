import redis from '@src/bin/redis';
import { Status } from '@src/config/server_config';
import { Controller, Get, Post } from '@src/descriptor/controller';
import Middleware from '@src/descriptor/middleware';
import Validate from '@src/descriptor/validate';
import HttpError from '@src/models/httpError';
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
            await redis(async (client) => {
                const url = await client.hGet(UploadKeys, filename);

                if (url) {
                    // const data = await fsPromise.readFile(url);
                    res.download(url);
                } else {
                    throw new HttpError(Status.MISSING_PARAMS, 'file is not found');
                }
            });
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
        const { filename } = req.query;

        try {
            const filePath = await Util.findFilesRecursively(filename as string, path.join(process.cwd(), 'uploads'));

            res.download(filePath);
        } catch (error) {
            next(error);
        }
    }
}
