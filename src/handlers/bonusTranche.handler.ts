import cds, { Service as ServiceInterface } from "@sap/cds";
import { Handler, OnRead, Srv } from "cds-routing-handlers";
import { Service } from "typedi";
import { BonusTranche } from "../../@cds-models/BonusTrancheService";

const logger = cds.log("Bonus Tranche handler.");

@Service()
@Handler(BonusTranche.name)
export class BonusTrancheHandler {
  @OnRead()
  public async onRead(@Srv() srv: ServiceInterface) {
    logger.info("Bonus Tranche on Read handler!");
  }
}
