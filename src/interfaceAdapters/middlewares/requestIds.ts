import { requestContext } from "../../shared/context/requestContext.js";
import { randomUUID } from "crypto";

export const requestIdMiddleware = (req, res, next) => {
  const requestId = randomUUID();

  requestContext.run({ requestId }, () => {
    req.requestId = requestId;
    res.setHeader("X-Request-Id", requestId);
    next();
  });
};
