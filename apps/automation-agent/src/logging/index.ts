import pino from "pino";
import automationConfig from "../config";

export const logger = pino({
  level: automationConfig.logging.level,
  ...(automationConfig.logging.prettyPrint && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
    },
  }),
});

export default logger;