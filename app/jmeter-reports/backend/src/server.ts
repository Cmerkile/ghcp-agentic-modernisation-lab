import { createApp } from './app.ts';
import { config } from './config.ts';
import { ReportStore } from './store.ts';

const store = new ReportStore(config.databasePath);
const app = createApp(store);

const server = app.listen(config.port, () => {
  console.log(`JMeter reports API listening on http://localhost:${config.port}`);
  console.log(`Database: ${config.databasePath}`);
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    server.close(() => {
      store.close();
      process.exit(0);
    });
  });
}
