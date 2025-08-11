import { ApplicationBootstrap } from './application.bootstrap';

async function bootstrap(): Promise<void> {
  const app = new ApplicationBootstrap();
  await app.bootstrap();
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
