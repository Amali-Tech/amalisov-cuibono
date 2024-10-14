using cuibono as db from '../../db/schema';

@path: '/api/v1'
service BonusTrancheService @(requires: 'authenticated-user') {
    entity BonusTranche         as projection on db.BonusTranche;
    entity TrancheParticipation as projection on db.TrancheParticipation;
    entity Target               as projection on db.Target;
    @readonly
    entity Employee         as projection on db.Employee;
    @readonly
    entity Location             as projection on db.Location;
}
