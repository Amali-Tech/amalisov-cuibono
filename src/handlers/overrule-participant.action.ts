import { Handler } from "cds-routing-handlers";

@Handler(TrancheParticipation.name)
export class OverruleParticipantHandler {
  async handle() {
    throw new Error('Not implemented');
  }
}