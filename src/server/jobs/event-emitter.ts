import { EventEmitter } from "stream";

const globalForEventEmitter = globalThis as unknown as {
  eventEmitter: EventEmitter;
};

export const eventEmitter =
  globalForEventEmitter.eventEmitter || new EventEmitter();

if (process.env.NODE_ENV !== "production")
  globalForEventEmitter.eventEmitter = eventEmitter;
