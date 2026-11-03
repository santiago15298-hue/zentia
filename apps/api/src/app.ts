import { randomUUID } from 'node:crypto';
import cors from 'cors';
import express, { Router, type Express } from 'express';
import helmet from 'helmet';
import type { Logger } from 'pino';
import { pinoHttp } from 'pino-http';
import { SystemClock, type Clock } from './core/clock/index.js';
import type { Env } from './core/env/index.js';
import { createGeneralLimiter, errorHandler, notFoundHandler } from './core/http/index.js';
import {
  buildOpenApiDocument,
  createCoreRegistry,
  createDocsRouter,
} from './core/openapi/index.js';
import { createModules, type InfrastructureOverrides } from './modules/index.js';
import { quotesRouter } from './modules/quotes/quotes.routes.js';
import { dashboardRouter } from './modules/dashboard/dashboard.routes.js';
import { customersRouter } from './modules/customers/customers.routes.js';
import { productsRouter } from './modules/products/products.routes.js';
import { ordersRouter } from './modules/orders/orders.routes.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { configRouter } from './modules/config/config.routes.js';
import { aiRouter } from './modules/ai/ai.routes.js';
import { usersRouter } from './modules/users/users.routes.js';
export interface AppOptions {
  env: Env;
  logger: Logger;
  clock?: Clock;
  overrides?: InfrastructureOverrides;
}

export function createApp({
  env,
  logger,
  clock = new SystemClock(),
  overrides,
}: AppOptions): Express {
  const app = express();
  app.use(cors());
  app.disable('x-powered-by');
  app.set('trust proxy', env.TRUST_PROXY);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: { upgradeInsecureRequests: env.NODE_ENV === 'production' ? [] : null },
      },
    }),
  );
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(
    pinoHttp({
      logger,
      genReqId: (_req, res) => {
        const id = randomUUID();
        res.setHeader('x-request-id', id);
        return id;
      },
    }),
  );
  app.use(express.json({ limit: '100kb' }));

  const modules = createModules({
    env,
    clock,
    publicLimiter: createGeneralLimiter(),
    ...(overrides ? { overrides } : {}),
  });
  const api = Router();
  for (const module of modules) {
    api.use(module.basePath, module.router);
  }
  api.use('/quotes', quotesRouter); // Agregar la ruta de cotizaciones
  api.use('/dashboard', dashboardRouter); // Agregar la ruta del dashboard
  api.use('/customers', customersRouter); // Agregar la ruta de clientes
  api.use('/products', productsRouter); // Agregar la ruta de productos
  api.use('/orders', ordersRouter); // Agregar la ruta de pedidos
  api.use('/auth', authRouter); // Agregar la ruta de autenticación
  api.use('/config', configRouter); // Agregar la ruta de configuración
  api.use('/users', usersRouter); // Agregar la ruta de usuarios
  api.use('/api/ai', aiRouter);
  if (env.DOCS_ENABLED) {
    const document = buildOpenApiDocument([
      createCoreRegistry(),
      ...modules.map((module) => module.openapi),
    ]);
    api.use('/docs', createDocsRouter(document));
  }
  api.use(notFoundHandler);

  app.use('/api', api);
  app.use(errorHandler);
  return app;
}
