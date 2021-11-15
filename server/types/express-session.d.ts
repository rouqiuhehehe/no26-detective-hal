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
        uid: number;
        authorization: string;
        success: Success;
    }
}

export {};
