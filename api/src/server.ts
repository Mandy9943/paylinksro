import { buildApp } from "./app/app.js";
import { env } from "./config/env.js";

const app = buildApp();

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${env.PORT}`);
});
