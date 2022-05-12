import BaseHandler from '@src/models/BaseHandler';
import Dao from './Dao';
import { NextFunction } from 'express';

const dao = new Dao();
export default class extends BaseHandler<Dao> {
    protected get dao() {
        return dao;
    }

    public async addUserAction(req: ExpressRequest, res: ExpressResponse, _next: NextFunction) {
        const { userId, roleId } = req.body;
        const uid = req.user.uid;
        if (typeof roleId === 'string' && userId instanceof Array) {
            if (uid) {
                await this.dao.addUser(roleId, userId as string[], uid);
            } else {
                throw new Error('请登陆后操作');
            }
        } else {
            throw new Error('参数类型错误');
        }
        res.success();
    }
}
