import { Controller } from '@src/descriptor/controller';
import Log from '@src/descriptor/middleware/log';

@Log()
@Controller('/auth', true)
export default class {}
