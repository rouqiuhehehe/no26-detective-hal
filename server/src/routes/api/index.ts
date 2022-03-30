import { Controller } from '@src/descriptor/controller';
import Log from '@src/descriptor/middleware/log';
import BaseRoutes from '@src/models/BaseRoutes';
import BaseHandler from '@src/models/BaseHandler';
import BaseDao from '@src/models/BaseDao';

@Log()
@Controller('/api', true)
export default abstract class Api<T extends BaseHandler<BaseDao>> extends BaseRoutes<T> {}
