import { Status } from '@src/config/server_config';

export default function resSendHandle(req: ExpressRequest, res: ExpressResPonse, next: NextFunction) {
    req.token = req.header('authorization')?.replace('Bearer ', '');

    res.error = (err, data?) => {
        res.send(
            data
                ? {
                      status: err.status,
                      success: false,
                      message: err.message
                  }
                : {
                      status: err.status,
                      success: false,
                      data,
                      message: err.message
                  }
        );
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
