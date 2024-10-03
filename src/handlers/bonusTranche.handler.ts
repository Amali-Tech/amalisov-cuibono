import cds, { Request } from "@sap/cds";
import { BeforeCreate, BeforeDelete, BeforeUpdate, Handler, ParamObj, Req } from "cds-routing-handlers";
import { Service } from "typedi";
import { BonusTranche, Target } from "../../@cds-models/BonusTrancheService";
import {DeleteParam} from '../utils/types/delete-bonus-tranche';

const logger = cds.log("Bonus Tranche handler.");

@Service()
@Handler(BonusTranche.name)
export class BonusTrancheHandler {

  @BeforeCreate()
  public async beforeCreate(@Req() req: Request) {
    try {
      logger.info("Bonus Tranche before Create handler!");

      const targets: Target[] = req.data.Target;
      const { ID: bonusTrancheId } = req.data;

      for (const target of targets) {
        target.BonusTranche_ID = bonusTrancheId;
        await INSERT.into(Target).entries(target);
      }
        
    } catch (error: unknown) {
      throw new Error(`Error in beforeCreate handler: ${error}`);
    }
  }

  @BeforeUpdate()
  public async beforeUpdate(@Req() req: Request) {
    try {
      logger.info("Bonus Tranche on Update handler!");

      const targets: Target[] = req.data.Target;
      const { ID: bonusTrancheId } = req.data;

      // Delete all targets before updating them
      await DELETE.from(Target.name).where({ BonusTranche_ID: bonusTrancheId });

      for (const target of targets) {
        if (!target.ID) {
          target.BonusTranche_ID = bonusTrancheId;
          await INSERT.into(Target).entries(target);
        } else {
          await UPDATE.entity(Target).set(target).where({ ID: target.ID });
        }
      }

    } catch (error: unknown) {
      throw new Error(`Error in beforeUpdate handler: ${error}`);
    }
  }


  @BeforeDelete()
  public async beforeDelete(@ParamObj() deleteParams: DeleteParam) {
    try {
      logger.info("Bonus Tranche on Delete handler!");

      const { ID: trancheToBeDeletedId } = deleteParams;

      await DELETE.from(Target.name).where({ BonusTranche_ID: trancheToBeDeletedId });

    } catch (error: unknown) {
      throw new Error(`Error in AfterDelete handler: ${error}`);
    }
  }
}