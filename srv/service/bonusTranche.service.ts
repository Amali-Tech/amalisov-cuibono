import { Service } from "@sap/cds";
import { createCombinedHandler } from "cds-routing-handlers";
import { BonusTrancheHandler } from "../../src/handlers/bonusTranche.handler";
import { UpdateBonusTranche } from "../../src/handlers/update-bonusTranche.action";

module.exports = (srv: Service) => {
  const combinedHandler = createCombinedHandler({
    handler: [BonusTrancheHandler, UpdateBonusTranche],
    middlewares: [],
  });
  combinedHandler(srv);
};
