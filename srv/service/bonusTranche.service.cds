using cuibono as db from '../../db/schema';

service BonusTrancheService @(require: 'authenticated-user') {
    entity BonusTranche         as projection on db.BonusTranche;
    entity TrancheParticipation as projection on db.TrancheParticipation;
    entity Target               as projection on db.Target;
    entity Participants         as projection on db.Person;

    @readonly
    entity Location             as projection on db.Location;
}
