import redis from '@src/bin/redis';
import { ErrorMsg } from '@src/config/error';
import { Status } from '@src/config/server_config';
import { Controller, Post } from '@src/descriptor/controller';
import Middleware from '@src/descriptor/middleware';
import HttpError from '@src/models/httpError';
import Upload, { UploadKeys } from '@src/models/upload';
import Util from '@util';
import dictionary from '.';

@Controller('/upload')
export default class extends dictionary {
    // @Validate({
    //     file: Joi.any().required()
    // })
    @Middleware()
    @Post('/img')
    public async uploadImg(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
        const upload = new Upload('/uploads', {
            fileId: 'file',
            fileType: 'img'
        });

        upload.single('file')(req, res, async (err) => {
            if (err) {
                if (Util.isExtendsHttpError(err)) {
                    next(err);
                } else {
                    next(new HttpError(Status.MISSING_PARAMS, err.message, err));
                }
                return;
            }

            if (req.file) {
                const md5File = Util.md5Crypto(req.file.buffer!.toString());

                try {
                    await redis(async (client, quit) => {
                        const url = await client.hGet(UploadKeys, md5File);
                        console.log(url);

                        if (url) {
                            res.success({
                                url: Util.getUrlWithHost(url)
                            });
                        } else {
                            await quit();
                            const url = await upload.saveFile(req.file!, md5File);

                            res.success({
                                url
                            });
                        }
                    });
                } catch (error) {
                    next(new HttpError(Status.SERVER_ERROR, ErrorMsg.REDIS_ERROR, err));
                }
            } else {
                next(new HttpError(Status.MISSING_PARAMS, 'file is required'));
            }
        });
    }
}
