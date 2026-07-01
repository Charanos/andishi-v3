/**
 * Structured JSON logger. Plain console output is intentional - Vercel and
 * most log aggregators ingest stdout/stderr directly, so this avoids adding
 * a logging transport dependency. Never pass secrets or full PII payloads;
 * pass IDs and short context only.
 */

export type LogFields = Record<string, unknown>;

interface LogEntry extends LogFields {
  level: "info" | "warn" | "error";
  message: string;
  timestamp: string;
}

function write(level: LogEntry["level"], message: string, fields?: LogFields) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...fields,
  };

  const line = JSON.stringify(entry);

  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  info: (message: string, fields?: LogFields) => write("info", message, fields),
  warn: (message: string, fields?: LogFields) => write("warn", message, fields),
  error: (message: string, fields?: LogFields) => write("error", message, fields),
};
