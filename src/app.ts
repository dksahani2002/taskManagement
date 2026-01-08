import express from 'express';
import { logger } from './shared/logger/index.js';
import userRoutes from './interfaceAdapters/routes/user.routes.js';
import { requestIdMiddleware } from './interfaceAdapters/middlewares/requestIds.js';

const app = express();
app.use(express.json());
// requestId creation middleware
app.use(requestIdMiddleware);
// Register user routes
app.use('/api/users', userRoutes);    

//Register task routes
import taskRoutes from './interfaceAdapters/routes/task.routes.js';
app.use('/api/tasks', taskRoutes);

//Register Audit routes
import auditRoutes from './interfaceAdapters/routes/audit.routes.js';
app.use('/api/audit',auditRoutes);

//Register ErrorMiddleware 

import { errorMiddleware } from './interfaceAdapters/middlewares/errors/errorMiddleware.js';


app.use(errorMiddleware(logger));

export default app;