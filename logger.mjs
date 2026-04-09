import fs from "node:fs";

const logFile = "./app.log";

function getTimestamp() {
  return new Date().toISOString();
}

function writeLog(level, message) {
  const line = `[${getTimestamp()}] [${level}] ${message}\n`;

  if (level !== "DEBUG") {
    console.log(line.trim());
  }

  fs.appendFileSync(logFile, line);
}

export function logInfo(message) {
  writeLog("INFO", message);
}

export function logError(message) {
  writeLog("ERROR", message);
}

export function logDebug(message) {
  writeLog("DEBUG", message);
}
