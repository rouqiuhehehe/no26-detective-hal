import { Controller, Get } from '@src/descriptor/controller';
import Middleware from '@src/descriptor/middleware';
import { Request, Response } from 'express';
import admin from '..';

@Controller('/')
export default class extends admin {
    @Middleware(['default'])
    @Get('/test')
    public testRoute(_req: Request, res: Response) {
        res.success({
            value: true
        });
    }

    // private homePageRender() {
    //     return 'this is student homepage, welcome!';
    // }

    private homePageRender() {
        return 'hello world! \n admin server';
    }
}
