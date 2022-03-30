import Admin from '@src/routes/admin';
import { Controller, Get, Post } from '@src/descriptor/controller';
import Handler from './Handler';

const handler = new Handler();
@Controller('/test')
export default class extends Admin {
    @Post('/insert')
    public async insertTest(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
        req.user.uid = 'e66e01a0-aa45-4e38-b654-8c3b3b5e2aa6';
        await handler.insertAction(req, res, next);
    }

    @Get('/views')
    public async viewsTest(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
        await handler.viewsAction(req, res, next);
    }

    @Get('/')
    public async listTest(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
        await handler.listAction(req, res, next);
    }

    @Post('/delete')
    public async deleteTest(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
        await handler.deleteAction(req, res, next);
    }

    @Get('/bulk-views')
    public async bulkViewsTest(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
        await handler.bulkViewsAction(req, res, next);
    }

    @Post('/bulk-delete')
    public async bulkDeleteTest(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
        await handler.bulkDeleteAction(req, res, next);
    }

    @Post('/bulk-update')
    public async bulkUpdateTest(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
        await handler.bulkUpdateAction(req, res, next);
    }

    @Post('/update')
    public async updateTest(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
        req.user.uid = 'e66e01a0-aa45-4e38-b654-8c3b3b5e2aa6';
        await handler.updateAction(req, res, next);
    }
}