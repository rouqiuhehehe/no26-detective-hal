import { Controller, Get } from '@src/descriptor/controller';

@Controller('/', true)
export default class RootRoute {
    @Get('/404')
    public notFount(_req: ExpressRequest, res: ExpressResPonse) {
        res.render('404');
    }

    @Get('/')
    public async indexPage(_req: ExpressRequest, res: ExpressResPonse) {
        res.send('<h1>hello 26！</h1>');
    }
}
