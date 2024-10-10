using cuibono as db from '../../db/schema';

service BonusTrancheService @(requires: 'authenticated-user') {
    entity BonusTranche         as projection on db.BonusTranche;
    entity TrancheParticipation as projection on db.TrancheParticipation;
    entity Target               as projection on db.Target;
    @readonly
    entity Employee         as projection on db.Employee;

    @readonly
    entity Department         as projection on db.Department;

    @readonly
    entity Attendance         as projection on db.Attendance;

    @readonly
    entity Location             as projection on db.Location;
}
