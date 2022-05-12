import { Controller, Get } from '@src/descriptor/controller';

@Controller('/', true)
export default class RootRoute {
    @Get('/404')
    public notFount(req: ExpressRequest, res: ExpressResponse) {
        const locals = req.session.locals;
        req.session.locals = undefined;
        if (locals) {
            res.locals = locals;
        }
        res.render('404');
    }

    @Get('/')
    public async indexPage(_req: ExpressRequest, res: ExpressResponse) {
        res.send('<h1>hello 26！</h1>');
    }
}
