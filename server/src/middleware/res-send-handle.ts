import { Status } from '@src/config/server_config';

export default function resSendHandle(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
    req.user = {};
    req.user.token = req.header('authorization')?.replace('Bearer ', '');

    res.error = (err, data?) => {
        const dev = process.env.NODE_ENV === 'development';
        res.send(
            data
                ? {
                      status: err.status,
                      success: false,
                      data,
                      message: dev ? err.message : 'server error'
                  }
                : {
                      status: err.status,
                      success: false,
                      message: dev ? err.message : 'server error'
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
