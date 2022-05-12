import Api from '@src/routes/api';
import Handler from '@src/routes/api/test/Handler';
import { Controller, SuperRoutes, SuperRoutesValidator } from '@src/descriptor/controller';
import validation from './validation';

const handler = new Handler();
@SuperRoutesValidator(validation)
@SuperRoutes
// @TurnOffParamsValidate
@Controller('/test')
export default class Test extends Api<Handler> {
    protected get handler() {
        return handler;
    }
}
