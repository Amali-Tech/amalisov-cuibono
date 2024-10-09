using cuibono as db from '../../db/schema';

service BonusTrancheService @(requires: 'authenticated-user') {
    entity BonusTranche         as projection on db.BonusTranche;
    entity TrancheParticipation as projection on db.TrancheParticipation;
    entity Target               as projection on db.Target;
    @readonly
    entity Participant         as projection on db.Participant;

    @readonly
    entity Location             as projection on db.Location;
}
