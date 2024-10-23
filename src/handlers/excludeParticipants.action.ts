import cds, { __UUID, Request } from "@sap/cds";
import { Action, Handler, ParamObj, Req } from "cds-routing-handlers";
import { Service } from "typedi";
import { TrancheParticipation } from "../../@cds-models/cuibono";
import { QLExtensions } from "@sap/cds";

const logger = cds.log("Exclude Participants action.");

interface ExclusionDataInterface {
  trancheParticipationIds: __UUID[];
  justification: string;
}

@Handler()
@Service()
export class ExcludeParticipants {
  @Action("excludeParticipants")
  public async excludeParticipants(
    @ParamObj() exclusionData: ExclusionDataInterface,
    @Req() req: Request
  ) {
    logger.info("Exclude Participants action handler.");
    try {
      const { trancheParticipationIds, justification } = exclusionData;

      const participationToExcludeData: TrancheParticipation[] = await SELECT(
        TrancheParticipation,
        (trancheParticipationRecord) => {
          const extendedTrancheParticipation =
            trancheParticipationRecord as unknown as QLExtensions<
              Required<TrancheParticipation>
            >;
          extendedTrancheParticipation("*");
          extendedTrancheParticipation.bonusTranche("*");
        }
      ).where({
        ID: { in: trancheParticipationIds },
      });

      const completedParticipations = participationToExcludeData.filter(
        (participation) => participation.bonusTranche?.status === "Completed"
      );

      if (completedParticipations.length > 0) {
        return req.reject(
          400,
          "Can't exclude a participant in Completed bonus tranche."
        );
      }

      for (const participationID of trancheParticipationIds) {
        await UPDATE(TrancheParticipation.name)
          .where({ ID: participationID })
          .with({
            justification: justification,
            excluded: true,
          });
      }

      return { message: "Participants Excluded Successfully!" };
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
}
