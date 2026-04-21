import morgan from "morgan";
import chalk from "chalk";

export interface LoggerConfig {
  format: string;
  timeFormat: string;
  skip?: (req: any, res: any) => boolean;
}

export function DefaultLoggerConfig(): LoggerConfig {
  return {
    format: "combined",
    timeFormat: "YYYY-MM-DD HH:mm:ss",
  };
}

export function createLoggerMiddleware(options?: { skip?: (req: any, res: any) => boolean }) {
  return morgan((tokens, req, res) => {
    const time = new Date().toISOString().replace("T", " ").substring(0, 19);
    const status = tokens.status(req, res);
    const latency = tokens["response-time"](req, res) || "0";
    const ip = (req as any).ip || req.socket?.remoteAddress || "unknown";
    const method = tokens.method(req, res);
    const url = tokens.url(req, res) || "";
    
    const queryIndex = url.indexOf("?");
    const path = queryIndex !== -1 ? url.substring(0, queryIndex) : url;
    const queryParams = queryIndex !== -1 ? url.substring(queryIndex) : "";
    
    const coloredStatus = status && parseInt(status) >= 400 
      ? chalk.red(status) 
      : chalk.green(status || "-");
    
    return [
      chalk.gray(time),
      "|",
      coloredStatus,
      "|",
      chalk.yellow(`${latency}ms`),
      "|",
      chalk.cyan(ip),
      "|",
      chalk.blue(method || "-"),
      "|",
      path,
      queryParams ? chalk.gray(queryParams) : "",
    ].join(" ");
  }, {
    skip: options?.skip || ((req) => req.url?.startsWith("/health") || false),
  });
}

export function createDevLogger() {
  return morgan((tokens, req, res) => {
    const time = new Date().toISOString().substring(11, 19);
    const status = tokens.status(req, res);
    const method = tokens.method(req, res);
    const url = tokens.url(req, res);
    const responseTime = tokens["response-time"](req, res);
    
    const coloredStatus = status && parseInt(status) >= 400 
      ? chalk.red(status) 
      : chalk.green(status || "-");
    
    const coloredMethod = method === "GET" 
      ? chalk.green(method) 
      : method === "POST" 
      ? chalk.yellow(method)
      : method === "DELETE"
      ? chalk.red(method)
      : chalk.blue(method || "-");

    return [
      chalk.gray(`[${time}]`),
      coloredMethod,
      url,
      coloredStatus,
      chalk.gray(`${responseTime}ms`),
    ].join(" ");
  });
}

export default {
  DefaultLoggerConfig,
  createLoggerMiddleware,
  createDevLogger,
};
