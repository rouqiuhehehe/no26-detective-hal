import { Get } from '@src/descriptor/controller';
import Middleware from '@src/descriptor/middleware';
import HttpError from '@src/models/httpError';
import User from '@src/models/user';
import UserOperation from '..';

const user = new User();
export default class GetUser extends UserOperation {
    @Middleware(['default'])
    @Get('/get-user')
    public async getUser(req: ExpressRequest, res: ExpressResPonse) {
        this.getUserHandle(req, res);
    }

    private async getUserHandle(req: ExpressRequest, res: ExpressResPonse) {
        try {
            const userInfo = await user.getUserInfoByToken(req);

            res.success(userInfo);
        } catch (e) {
            if (e instanceof HttpError) {
                res.error(e);
            }
        }
    }
}
