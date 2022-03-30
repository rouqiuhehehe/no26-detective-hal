import { Get, IsAbstractRoutes, Post } from '@src/descriptor/controller';
import BaseHandler from '@src/models/BaseHandler';
import BaseDao from '@src/models/BaseDao';
import Middleware from '@src/descriptor/middleware';

@IsAbstractRoutes
export default abstract class RootRoute<T extends BaseHandler<BaseDao>> {
    protected abstract get handler(): T;

    @Middleware()
    @Post('/insert')
    public async insertTest(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
        req.user.uid = 'e66e01a0-aa45-4e38-b654-8c3b3b5e2aa6';
        await this.handler.insertAction(req, res, next);
    }

    @Middleware()
    @Get('/view')
    public async viewsTest(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
        await this.handler.viewsAction(req, res, next);
    }

    @Middleware()
    @Get('/')
    public async listTest(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
        await this.handler.listAction(req, res, next);
    }

    @Middleware()
    @Post('/delete')
    public async deleteTest(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
        await this.handler.deleteAction(req, res, next);
    }

    @Middleware()
    @Get('/bulk-view')
    public async bulkViewsTest(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
        await this.handler.bulkViewsAction(req, res, next);
    }

    @Middleware()
    @Post('/bulk-delete')
    public async bulkDeleteTest(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
        await this.handler.bulkDeleteAction(req, res, next);
    }

    @Middleware()
    @Post('/bulk-update')
    public async bulkUpdateTest(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
        await this.handler.bulkUpdateAction(req, res, next);
    }

    @Middleware()
    @Post('/update')
    public async updateTest(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
        req.user.uid = 'e66e01a0-aa45-4e38-b654-8c3b3b5e2aa6';
        await this.handler.updateAction(req, res, next);
    }
}
