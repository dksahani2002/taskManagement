function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is required but not set.`);
  }
  return value;
}

function numberEnv(name: string, defaultValue?: number): number {
  const raw = process.env[name];
  if (raw === undefined) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Environment variable ${name} is required`);
  }
  const value = Number(raw);
  if (Number.isNaN(value)) {
    throw new Error(`Environment variable ${name} must be a number`);
  }
  return value;
}

export const env = {
  port: numberEnv("PORT", 3000),
  nodeEnv: process.env.NODE_ENV || "development",

  mongo: {
    mongoUri: requireEnv("MONGO_URI"),
  },

  agenda: {
    collection: requireEnv("AGENDA_COLLECTION"),
    processEvery: requireEnv("AGENDA_PROCESS_EVERY"),
  },

  task: {
    reminderOffsetMinutes: numberEnv("REMINDER_OFFSET_MINUTES", 1),
    autoCloseDays: numberEnv("AUTO_CLOSE_DAYS", 7),
    reminderOverdueHours: numberEnv("REMINDER_OVERDUE_HOURS", 1),
  },
};
