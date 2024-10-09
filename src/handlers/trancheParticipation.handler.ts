import { BeforeRead, Handler, OnRead, Req } from "cds-routing-handlers";
import cds, { Request } from '@sap/cds'
import { Service } from "typedi";
import { TrancheParticipation } from "../../@cds-models/BonusTrancheService";


const logger = cds.log("Tranche Participation handler");
@Service()
@Handler(TrancheParticipation.name)
export class TrancheParticipationHandler { 
  @BeforeRead()
  public async beforeRead(@Req()req: Request) {
    logger.info("Tranche Participation on Read handler!");
    try {
      
      const trancheParticipation = await SELECT.from(TrancheParticipation.name)
        .columns((trancheParticipation: TrancheParticipation) => {
          const id = trancheParticipation.ID;
          const calculatedPayoutAmount = trancheParticipation.calculatedPayoutAmount;
          const excluded = trancheParticipation.excluded;
          const finalPayoutAmount = trancheParticipation.finalPayoutAmount;
          const justification = trancheParticipation.justification;
          const participantName = trancheParticipation.participant?.name;
          const participantDepartment = trancheParticipation.participant?.department;
          const locationName = trancheParticipation.bonusTranche?.Location?.name;
          const bonusTrancheId = trancheParticipation.bonusTranche?.ID;
          const beginDate = trancheParticipation.bonusTranche?.beginDate;
          const endDate = trancheParticipation.bonusTranche?.endDate;
          const trancheWeight = trancheParticipation.bonusTranche?.trancheWeight;
          const status = trancheParticipation.bonusTranche?.status;

        return { id, calculatedPayoutAmount, excluded, finalPayoutAmount, justification, participantName, participantDepartment, locationName, bonusTrancheId, beginDate,endDate, trancheWeight, status };
        })
        
      req.data = trancheParticipation;
    } catch (error) {
      logger.error(`Error in OnRead handler: ${error}`);
      throw error
    }
    return;
  }

  @OnRead()
  public async onRead(@Req()req: Request) {
    logger.info("Tranche Participation on Read handler!");
    return req.data;
  }
}

