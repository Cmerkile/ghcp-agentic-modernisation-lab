import { createApp } from './app.js';
import { config } from './config.js';
import { ReportStore } from './store.js';

const store = new ReportStore(config.databasePath, {
  maxStoredSamples: config.maxStoredSamples,
});
const app = createApp(store);

const server = app.listen(config.port, () => {
  console.log(`JMeter reports API (JS) listening on http://localhost:${config.port}`);
  console.log(`Database: ${config.databasePath}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(() => {
      store.close();
      process.exit(0);
    });
  });
}
