import WebSocket from "ws";

export type RequestHandler<T = unknown> = (data: T, ws: WebSocket) => void | Promise<void>;
