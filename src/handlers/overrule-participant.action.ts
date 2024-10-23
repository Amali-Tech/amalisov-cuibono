import cds, { __UUID } from '@sap/cds'
import { Action, Handler, ParamObj } from "cds-routing-handlers";
import { Service } from "typedi";
import { TrancheParticipation } from '../../@cds-models/BonusTrancheService';

const logger = cds.log("Overrule participant action.");
interface IParticipant {
  participants: __UUID[];
  justification: string;
  amount: number;
}
@Handler()
@Service()
export class OverruleParticipantAction {
  @Action("overruleParticipant")
  public async overruleParticipant(
    @ParamObj() participantData: IParticipant
  ) {
    logger.info("Overrule participant action Handler!");

    const { participants, justification, amount } = participantData;      
    try {
      for (const participant of participants) {
        await UPDATE(TrancheParticipation.name)
          .where({ ID: participant })
          .with({
            overRuled: true,
            justification: justification,
            finalAmount: amount
          })
      }
      return {
        message: "Participants overruled successfully"
      };
    } catch (error) {
      logger.error(error);
      throw error
    }
    
  }
}


