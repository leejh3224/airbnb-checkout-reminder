import chalk from "chalk";
import { stripIndent } from "common-tags";
import { createLogger, format, transports } from "winston";

const { printf } = format;

const timestamp = new Date(Date.now()).toLocaleDateString("ko-KR", {
	weekday: "long",
	month: "numeric",
	day: "numeric",
	hour: "numeric",
	minute: "numeric",
	second: "numeric",
});

const logger = createLogger({
	transports: [
		new transports.Console({
			format: printf((info) => {
				const colorize =
					info.level === "info" ? chalk.blue : chalk.red;

				return stripIndent`
          level: ${colorize(`[${info.level.toUpperCase()}]`)}
          message: ${info.message}
          timestamp: ${chalk.bold(timestamp)}
          ${info.stack ? `stack: ${info.stack}` : ""}
        `;
			}),
		}),
	],
});

export default logger;
