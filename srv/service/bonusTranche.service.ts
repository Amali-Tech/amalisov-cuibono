import { Service } from "@sap/cds";
import { createCombinedHandler } from "cds-routing-handlers";
import { BonusTrancheHandler } from "../../src/handlers/bonusTranche.handler";

module.exports = (srv: Service) => {
  const combinedHandler = createCombinedHandler({
    handler: [BonusTrancheHandler],
    middlewares: [],
  });
  combinedHandler(srv);
};
