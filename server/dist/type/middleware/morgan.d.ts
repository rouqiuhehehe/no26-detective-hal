/// <reference types="node" />
export default class Morgan {
    private dirPath;
    constructor(dirPath: string);
    useLogger(): (req: import("http").IncomingMessage, res: import("http").ServerResponse, callback: (err?: Error | undefined) => void) => void;
    private morganforMat;
    private fileStreamRotatorGetStream;
}
