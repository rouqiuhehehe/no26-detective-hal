import { Get } from '@src/descriptor/controller';
import Middleware from '@src/descriptor/middleware';
import HttpError from '@src/models/httpError';
import User from '@src/models/user';
import UserOperation from '..';

const user = new User();
export default class GetUser extends UserOperation {
    @Middleware(['default'])
    @Get('/get-user')
    public async getUser(req: ExpressRequest, res: ExpressResponse) {
        await this.getUserHandle(req, res);
    }

    private async getUserHandle(req: ExpressRequest, res: ExpressResponse) {
        try {
            const userInfo = await user.getUserInfoByToken(req.user.token);
            const { nickname, avatar, create_time, username, update_time, phone, role, roleValue } = userInfo;
            res.success({
                nickname,
                avatar,
                create_time,
                username,
                update_time,
                phone,
                role: role?.split(','),
                roleValue: roleValue?.split(',')
            });
        } catch (e) {
            if (e instanceof HttpError) {
                res.error(e);
            }
        }
    }
}
