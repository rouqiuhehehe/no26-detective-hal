import { Post } from '@src/descriptor/controller';
import Middleware from '@src/descriptor/middleware';
import HttpError from '@src/models/httpError';
import User from '@src/models/user';
import UserOperation from '..';

const user = new User();
export default class extends UserOperation {
    @Middleware(['default'])
    @Post('/login-out')
    public async loginOut(req: ExpressRequest, res: ExpressResponse) {
        await this.loginOutHandle(req, res);
    }

    private async loginOutHandle(req: ExpressRequest, res: ExpressResponse) {
        try {
            const isSuccess = await user.loginOut(req);

            res.success(isSuccess);
        } catch (e) {
            if (e instanceof HttpError) {
                res.error(e);
            }
        }
    }
}
