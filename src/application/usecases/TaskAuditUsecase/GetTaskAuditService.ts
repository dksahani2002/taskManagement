import { Logger } from "../../../shared/logger/Logger.js";
import { AuditRepository } from "../../ports/repositories/AuditRepository.js";

export class GetTaskAuditService {
  constructor(
    private auditRepository: AuditRepository,
    private logger: Logger
  ) {}

  async execute(taskId: string) {
    this.logger.info("Fetching task audit trail", { taskId });

    const audits = await this.auditRepository.findByTaskId(taskId);

    this.logger.info("Task audit trail fetched", {
      taskId,
      count: audits.length
    });

    return audits;
  }
}
