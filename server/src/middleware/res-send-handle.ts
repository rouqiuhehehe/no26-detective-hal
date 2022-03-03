import { Status } from '@src/config/server_config';

export default function resSendHandle(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
    req.token = req.header('authorization')?.replace('Bearer ', '');

    res.error = (err, data?) => {
        res.send(
            data
                ? {
                      status: err.status,
                      success: false,
                      data,
                      message: err.message
                  }
                : {
                      status: err.status,
                      success: false,
                      message: err.message
                  }
        );
    };

    res.success = (body, pagination?) => {
        res.send(
            pagination
                ? {
                      status: Status.SUCCESS,
                      data: body ?? {
                          value: true
                      },
                      pagination,
                      success: true
                  }
                : {
                      status: Status.SUCCESS,
                      data: body ?? {
                          value: true
                      },
                      success: true
                  }
        );
    };

    next();
}
