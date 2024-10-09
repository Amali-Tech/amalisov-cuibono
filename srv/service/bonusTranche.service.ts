import { Service } from "@sap/cds";
import { createCombinedHandler } from "cds-routing-handlers";
import { BonusTrancheHandler } from "../../src/handlers/bonusTranche.handler";
import {TrancheParticipationHandler} from "../../src/handlers/trancheParticipation.handler";

module.exports = (srv: Service) => {
  const combinedHandler = createCombinedHandler({
    handler: [BonusTrancheHandler, TrancheParticipationHandler],
    middlewares: [],
  });
  combinedHandler(srv);
};
