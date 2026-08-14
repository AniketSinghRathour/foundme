// Plain console.log with structured JSON - CloudWatch Logs Insights can
// query these fields directly once logs are shaped like this.

export function createLogger(baseContext = {}) {
  const log = (level, message, extra = {}) => {
    console.log(
      JSON.stringify({
        level,
        message,
        timestamp: new Date().toISOString(),
        ...baseContext,
        ...extra,
      })
    );
  };

  return {
    info: (message, extra) => log("INFO", message, extra),
    warn: (message, extra) => log("WARN", message, extra),
    error: (message, extra) => {
      const errInfo =
        extra?.error instanceof Error
          ? { errorMessage: extra.error.message, stack: extra.error.stack }
          : {};
      log("ERROR", message, { ...extra, ...errInfo, error: undefined });
    },
    child: (extraContext) => createLogger({ ...baseContext, ...extraContext }),
  };
}
