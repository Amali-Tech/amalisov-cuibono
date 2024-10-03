import cds, { Request } from "@sap/cds";
import { AfterDelete, BeforeCreate, BeforeUpdate, Handler, ParamObj, Req } from "cds-routing-handlers";
import { Service } from "typedi";
import { BonusTranche, Target } from "../../@cds-models/BonusTrancheService";
import validateInputTarget from "../utils/validateTarget";
import {DeleteParam} from '../utils/types/delete-bonus-tranche';

const logger = cds.log("Bonus Tranche handler.");

@Service()
@Handler(BonusTranche.name)
export class BonusTrancheHandler {

  @BeforeCreate()
  public async beforeCreate(@Req() req: Request) {
    logger.info("Bonus Tranche before Create handler!");

    let targets: Target[] = req.data.Target
    const { beginDate, endDate, ID: bonusTrancheId } = req.data
    const currentDate = new Date();
    const formattedBeginDate = new Date(beginDate);
    const formattedEndDate = new Date(endDate);
    
    if (formattedBeginDate <= currentDate) {
      return req.error(400, "Begin Date must be in the future");
    }

    if (formattedEndDate <= formattedBeginDate) {
      return req.error(400, "End Date must be after begin date");
    }

    if (!targets) {
      return;
    }

    if (typeof targets === "object") {
      targets = Array.isArray(targets) ? targets : [targets];
    }

    if (!validateInputTarget(targets)) {
      return req.error(400, "Target must have name and weight");
    }

    for (const target of targets) {
      target.BonusTranche_ID = bonusTrancheId
      await INSERT.into(Target).entries(target)
    }
  }

  @BeforeUpdate()
  public async beforeUpdate(@Req() req: Request) {
    logger.info("Bonus Tranche on Update handler!");

    let targets: Target[] = req.data.Target
    const { beginDate, endDate, ID: bonusTrancheId } = req.data
    const currentDate = new Date();
    const formattedBeginDate = new Date(beginDate);
    const formattedEndDate = new Date(endDate);
    
    if (formattedBeginDate <= currentDate) {
      return req.error(400, "Begin Date must be in the future");
    }

    if (formattedEndDate <= formattedBeginDate) {
      return req.error(400, "End Date must be after begin date");
    }

    if (!targets) {
      return;
    }

    if (typeof targets === "object") {
      targets = Array.isArray(targets) ? targets : [targets];
    }

    if (!validateInputTarget(targets)) {
      return req.error(400, "Target must have name and weight");
    }

    for (const target of targets) {
      if (!target.ID) {
        target.BonusTranche_ID = bonusTrancheId
        await INSERT.into(Target).entries(target)
        continue
      }

      await UPDATE.entity(Target).set(target).where({ ID: target.ID })
    }
  }

  @AfterDelete()
  public async afterDelete(@ParamObj() deleteParams: DeleteParam) {
    logger.info("Bonus Tranche on Delete handler!");

    const { ID:trancheToBeDeletedId } = deleteParams;

    await DELETE.from(Target.name).where({ BonusTranche_ID: trancheToBeDeletedId })
  }
}
