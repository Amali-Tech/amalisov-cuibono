import cds, { Request } from "@sap/cds";
import { BeforeCreate, Handler, Req } from "cds-routing-handlers";
import { Service } from "typedi";
import { BonusTranche, Target } from "../../@cds-models/BonusTrancheService";

const logger = cds.log("Bonus Tranche handler.");

@Service()
@Handler(BonusTranche.name)
export class BonusTrancheHandler {

  @BeforeCreate()
  public async beforeCreate(@Req() req: Request) {
    logger.info("Bonus Tranche on Create handler!");

    const targets: Target[] = req.data.Target
    const { beginDate, endDate, ID: bonusTrancheId } = req.data
    const currentDate = new Date();
    const formattedBeginDate = new Date(beginDate);
    const formattedEndDate = new Date(endDate);
    
    if (!(formattedBeginDate > currentDate)) {
      return req.error(400, "Begin Date must be in the future");
    }

    if (!(formattedEndDate > formattedBeginDate)) {
      return req.error(400, "End Date must be after begin date");
    }

    console.log(targets)

    if (!targets) {
      return 0;
    }

    for (const target of targets) {
      target.BonusTranche_ID = bonusTrancheId
      await INSERT.into(Target).entries(target)
    }
  }
}
