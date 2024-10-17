import cds, { Request } from "@sap/cds";
import { Action, Handler, ParamObj, Req } from "cds-routing-handlers";
import { Service } from "typedi";
import { BonusTranche, Target } from "../../@cds-models/BonusTrancheService";

const logger = cds.log("Update bonus tranche action.");

interface BonustrancheDataInterface {
  bonusTrancheId: string;
  name: string;
  beginDate: Date;
  endDate: Date;
  dateOfOrigin: Date;
  description: string;
  status: string;
  trancheWeight: number;
  targets: Target[];
}

@Handler()
@Service()
export class UpdateBonusTranche {
  @Action("updateBonusTranche")
  public async updateBonusTranche(
    @Req() req: Request,
    @ParamObj() trancheData: BonustrancheDataInterface
  ) {
    logger.info("Update bonus tranche action Handler!");
    try {
      const { targets, bonusTrancheId, ...updatedTrancheData } = trancheData;

      const trancheToUpdate: BonusTranche = await SELECT.one
        .from(BonusTranche.name)
        .where({
          ID: bonusTrancheId,
        });

      if (!trancheToUpdate) {
        return req.reject(404, "Bonus tranche with that ID doesn't exist.");
      }

      if (trancheToUpdate.status === "Completed") {
        return req.reject(400, "Completed bonus tranche can't be updated.");
      }

      if (
        trancheToUpdate.status === "Locked" &&
        updatedTrancheData.status === "Completed"
      ) {
        await await UPDATE(BonusTranche.name)
          .where({ ID: bonusTrancheId })
          .with({ status: "Completed" });

        return await SELECT.from(BonusTranche.name).where({
          ID: bonusTrancheId,
        });
      }

      if (
        trancheToUpdate.status === "Locked" &&
        updatedTrancheData.status !== "Running"
      ) {
        return req.reject(400, "Locked bonus tranche can't be updated.");
      }

      if (
        trancheToUpdate.status === "Running" &&
        updatedTrancheData.status === "Completed"
      ) {
        return req.reject(
          400,
          "you can't update a tranche status from running to complted."
        );
      }

      const formatedBeginDate = new Date(updatedTrancheData.beginDate);
      const formatedEndDate = new Date(updatedTrancheData.endDate);

      if (formatedBeginDate > formatedEndDate) {
        return req.reject(400, "EndDate can not be less that Begin Date.");
      }

      const totalTargetsWeight: number = targets.reduce(
        (acc, target) => acc + (target.weight ?? 0),
        0
      );

      if (totalTargetsWeight > 100) {
        return req.reject(400, "Total weight of targets must not exceed 100%");
      }

      if (
        updatedTrancheData.status === "Locked" &&
        totalTargetsWeight !== 100
      ) {
        return req.reject(
          400,
          "Bonus tranche can't be locked when total weight is not 100%"
        );
      }

      await DELETE.from(Target.name).where({ BonusTranche_ID: bonusTrancheId });

      for (const target of targets) {
        target.BonusTranche_ID = bonusTrancheId;
        await INSERT.into(Target).entries(target);
      }

      await UPDATE(BonusTranche.name)
        .where({ ID: bonusTrancheId })
        .with(updatedTrancheData);

      return await SELECT.from(BonusTranche.name).where({ ID: bonusTrancheId });
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
}
