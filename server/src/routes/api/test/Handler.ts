import BaseHandler from '@src/models/BaseHandler';
import Dao from './Dao';

const dao = new Dao();
export default class extends BaseHandler<Dao> {
    protected get dao() {
        return dao;
    }
}
