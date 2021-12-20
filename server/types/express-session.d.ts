declare module 'express-session' {
    interface Success {
        message: string;
    }
    interface sessionMessages {
        type: string;
        message: string;
    }
    export interface SessionData {
        messages: sessionMessages[];
        uid: string;
        authorization: string;
        success: Success;
        salt: string;
    }
}

export {};
