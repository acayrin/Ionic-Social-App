import WebSocket from "ws";
import { RequestSubData } from ".";

export type RequestHandler<T = RequestSubData, Y = RequestSubData> = (o: { d?: T; user?: string }) => Y | Promise<Y>;
