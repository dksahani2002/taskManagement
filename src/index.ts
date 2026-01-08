import "dotenv/config";
import app from './app.js';
import  connectDB  from './config/dbconfig.js';
import { agenda } from './infrastructure/scheduler/agenda.js';
import { registerTaskJobHandlers } from './infrastructure/scheduler/taskJobHandlers.js';
import { MongoTaskRepository } from './infrastructure/db/repositories/MongoTaskRepository.js';
import { env } from "./config/env.js";
import { MongoTaskAuditRepository } from "./infrastructure/db/repositories/MongoTaskAuditRepository.js";

const PORT = env.port;

async function startServer() {
  await connectDB();
// Register job handlers
  const taskRepository = new MongoTaskRepository();
  const auditRepository=new MongoTaskAuditRepository();
  registerTaskJobHandlers(taskRepository,auditRepository);    

  await agenda.start();
  console.log("Server time:", new Date().toISOString());
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
