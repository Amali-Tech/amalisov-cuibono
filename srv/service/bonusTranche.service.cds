using cuibono as db from '../../db/schema';

@path: '/api/v1'
service BonusTrancheService @(requires: 'authenticated-user') {
    entity BonusTranche         as projection on db.BonusTranche;
    entity TrancheParticipation as projection on db.TrancheParticipation;
    entity Target               as projection on db.Target;

    @readonly
    entity Employee             as projection on db.Employee;

    @readonly
    entity Location             as projection on db.Location;

    action updateBonusTranche(bonusTrancheId : String @mandatory,
                              name : String @mandatory,
                              beginDate : DateTime @mandatory,
                              endDate : DateTime @mandatory,
                              dateOfOrigin : DateTime @mandatory,
                              description : String,
                              status : String,
                              trancheWeight : Decimal,
                              Location_ID : String @mandatory,
                              targets : array of Target @mandatory ) returns BonusTranche;

    action overruleParticipant(
        participants: array of UUID @mandatory,
        justification: String,
        amount: Decimal @mandatory)returns {message: String};
        
    action excludeParticipants(trancheParticipationIds : array of UUID @mandatory,
                               justification : String @mandatory )   returns {};
}
