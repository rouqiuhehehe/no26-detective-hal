import { Status } from '@src/config/server_config';

export default function resSendHandle(_req: ExpressRequest, res: ExpressResPonse, next: NextFunction) {
    res.error = (err) => {
        res.send({
            status: err.status,
            success: false,
            message: err.message
        });
    };

    res.success = (body) => {
        res.send({
            status: Status.SUCCESS,
            data: body,
            success: true
        });
    };

    next();
}
