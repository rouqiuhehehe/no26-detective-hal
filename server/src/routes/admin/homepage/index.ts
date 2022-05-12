import { Controller, Get } from '@src/descriptor/controller';
import { Request, Response } from 'express';
import admin from '..';

@Controller('/')
export default class extends admin {
    @Get('/')
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
