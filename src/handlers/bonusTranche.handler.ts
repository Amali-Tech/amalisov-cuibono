import cds, { Request } from "@sap/cds";
import { AfterCreate, BeforeCreate, BeforeDelete, BeforeUpdate, Handler, ParamObj, Req } from "cds-routing-handlers";
import { Service } from "typedi";
import { BonusTranche, Employee, Target, TrancheParticipation } from "../../@cds-models/cuibono";
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

      const totalTargetsWeight: number = targets.reduce((acc, target) => acc + (target.weight ?? 0), 0);

      if (totalTargetsWeight > 100) { 
        return req.error(400, "Total weight of targets must not exceed 100%");
      }
      
      for (const target of targets) {
        target.BonusTranche_ID = bonusTrancheId;
        await INSERT.into(Target).entries(target);
      } 
    } catch (error) {
      logger.error(error)
      throw error;
    }
  }

  @AfterCreate()
  /**
   * Creates a TrancheParticipation for each Employee in the system.
   * Automatically triggered after a new BonusTranche is created.
   * @param {Request} req - The request containing the newly created BonusTranche.
   */
  public async afterCreate( @Req() req: Request) {
    try {
      logger.info("Bonus Tranche on After Create handler!");

      const newBonusTranche = req?.data
      const participantsInBonusTranche = await SELECT.from(Employee.name)

      for (const participant of participantsInBonusTranche) {
        await INSERT.into(TrancheParticipation.name)
          .entries({
            bonusTranche_ID: newBonusTranche.ID,
            participant_ID: participant.ID,
          })
      }
    } catch (error) {
      logger.error(error)
      throw error;
    }
  }

  @BeforeUpdate()
  public async beforeUpdate(@Req() req: Request) {
    try {
      logger.info("Bonus Tranche before Update handler!");

      const targets: Target[] = req.data.Target;
      const { ID: bonusTrancheId } = req.data;

      await DELETE.from(Target.name).where({ BonusTranche_ID: bonusTrancheId });

      const totalTargetsWeight: number = targets.reduce((acc, target) => acc + (target.weight ?? 0), 0);

      if (totalTargetsWeight > 100) { 
        return req.error(400, "Total weight of targets must not exceed 100%");
      }

      for (const target of targets) {
          target.BonusTranche_ID = bonusTrancheId;
          await INSERT.into(Target).entries(target);
      }
    } catch (error) {
      logger.error(error)
      throw error;
    }
  }


  @BeforeDelete()
  public async beforeDelete(@ParamObj() deleteParams: DeleteParam) {
    try {
      logger.info("Bonus Tranche before delete handler!");

      const { ID: trancheToBeDeletedId } = deleteParams;

      await DELETE.from(Target.name).where({ BonusTranche_ID: trancheToBeDeletedId });

    } catch (error) {
      logger.error(error)
      throw error;
    }
  }
}