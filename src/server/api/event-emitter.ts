import { EventEmitter } from "stream";

if (!global.eventEmitterSingleton) {
  console.log("Creating new event emitter singleton");
  global.eventEmitterSingleton = new EventEmitter();
} else {
  console.log("Returning existing event emitter singleton");
}

export const eventEmitter = global.eventEmitterSingleton as EventEmitter;
