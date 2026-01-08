// shared/logger/ConsoleLogger.ts
import { Logger } from "./Logger.js";
import { requestContext } from "../context/requestContext.js";
export class ConsoleLogger implements Logger {
  info(message: string, meta?: unknown): void {
     const ctx = requestContext.getStore();

    console.log(JSON.stringify({
      level: "info",
      requestId: ctx?.requestId,
      message,
      meta,
      timestamp: new Date().toISOString(),
    }));
  }

  warn(message: string, meta?: unknown): void {
    const ctx = requestContext.getStore();
    console.warn(JSON.stringify({
      level: "warn",
      requestId: ctx?.requestId,
      message,
      meta,
      timestamp: new Date().toISOString(),
    }));
  }

  error(message: string, meta?: unknown): void {
    const ctx = requestContext.getStore();
    console.error(JSON.stringify({
      level: "error",
      requestId: ctx?.requestId,
      message,
      meta,
      timestamp: new Date().toISOString(),
    }));
  }
}
