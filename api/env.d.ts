// Ambient types for process.env

namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV?: "development" | "test" | "production";
    PORT?: string;
    DATABASE_URL: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN?: string;
    APP_ORIGIN: string;
    API_ORIGIN: string;
    STRIPE_SECRET_KEY: string;
    STRIPE_PUBLISHABLE_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
    RESEND_API_KEY: string;
    MAIL_FROM: string;
  }
}
