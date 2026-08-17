import { createApp } from "./app.js";
import { db } from "./db/index.js";
import { env } from "./env.js";

const app = createApp(db);

app.listen(env.PORT, () => {
  console.log(`Servidor Stripe/Node.js escuchando en http://localhost:${env.PORT}`);
});
