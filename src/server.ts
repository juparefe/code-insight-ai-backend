import { app } from './app.js';
import { env } from './config/env.js';

app.listen(env.PORT, () => {
  console.log(
    `Code Insight AI Backend running on port ${env.PORT}`
  );
});