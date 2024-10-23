import { Service } from "@sap/cds";
import { createCombinedHandler } from "cds-routing-handlers";
import { BonusTrancheHandler } from "../../src/handlers/bonusTranche.handler";
import { UpdateBonusTranche } from "../../src/handlers/update-bonusTranche.action";
import { OverruleParticipantAction } from "../../src/handlers/overrule-participant.action";
import { ExcludeParticipants } from "../../src/handlers/excludeParticipants.action";

module.exports = (srv: Service) => {
  const combinedHandler = createCombinedHandler({
    handler: [
      BonusTrancheHandler,
      UpdateBonusTranche,
      OverruleParticipantAction,
      ExcludeParticipants
    ],
    middlewares: [],
  });
  combinedHandler(srv);
};
