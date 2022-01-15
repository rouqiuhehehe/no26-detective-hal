import redis from '@src/bin/redis';
import { Status } from '@src/config/server_config';
import { Controller, Post } from '@src/descriptor/controller';
import Middleware from '@src/descriptor/middleware';
import Validate from '@src/descriptor/validate';
import HttpError from '@src/models/httpError';
import { UploadKeys } from '@src/models/upload';
import fsPromise from 'fs/promises';
import Joi from 'joi';
import path from 'path';
import dictionary from '.';

@Controller('/download')
export default class extends dictionary {
    @Validate({
        filename: Joi.string().required()
    })
    @Middleware()
    @Post('/')
    public async downloadFile(req: ExpressRequest, res: ExpressResPonse, next: NextFunction) {
        let { filename } = req.body;

        const extname = path.extname(filename);

        filename = filename.replace(extname, '');

        try {
            await redis(async (client) => {
                const url = await client.hGet(UploadKeys, filename);

                if (url) {
                    const data = await fsPromise.readFile(url);
                    res.download(url);
                } else {
                    throw new HttpError(Status.MISSING_PARAMS, 'file is not found');
                }
            });
        } catch (error) {
            next(error);
        }
    }
}
