import { Post } from '@src/descriptor/controller';
import Middleware from '@src/descriptor/middleware';
import { DefaultMiddleWareType } from '@src/descriptor/middlewareHandle';
import Util from '@util';
import { execSync } from 'child_process';
import fs from 'fs';
import fsPromise from 'fs/promises';
import path from 'path';
import ManagementSystem from '..';

const publicKeyPath = path.join(`${ process.cwd() }/key/rsa_public.key`);

export default class GetUser extends ManagementSystem {
    @Middleware([DefaultMiddleWareType.ANTI_REPLAY, DefaultMiddleWareType.TIMESTAMP])
    @Post('/get-public-key')
    public async getPublicKey(req: ExpressRequest, res: ExpressResponse) {
        await this.getPublicKeyHandle(req, res);
    }

    private async getPublicKeyHandle(_req: ExpressRequest, res: ExpressResponse) {
        let publicKey = '';
        try {
            publicKey = (await fsPromise.readFile(publicKeyPath)).toString();
        } catch (e: any) {
            if (e.code === 'ENOENT') {
                if (!fs.existsSync(publicKeyPath)) {
                    Util.mkDirForFile(publicKeyPath);
                }
                execSync('openssl genrsa -out rsa_private.key 1024', { cwd: path.dirname(publicKeyPath) });
                execSync('openssl rsa -in rsa_private.key -pubout -out rsa_public.key', {
                    cwd: path.dirname(publicKeyPath)
                });
                publicKey = (await fsPromise.readFile(publicKeyPath)).toString();
            } else {
                res.error(e);
            }
        }

        if (publicKey) {
            res.success({
                key: publicKey.toString()
            });
        }
    }
}
