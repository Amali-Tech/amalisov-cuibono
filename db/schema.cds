namespace cuibono;

using {managed} from '@sap/cds/common';

type TrancheStatusEnum             : String @assert.range enum {
  Running;
  Locked;
  Completed;
};

type ParticipantCreationStatusEnum : String @assert.range enum {
  InProcess;
  Failed;
  Done;
}

entity Location {
  key ID   : UUID;
      name : String(50) not null;
}

entity Target {
  key ID           : UUID;
      name         : String(50) @mandatory;
      description  : String;
      weight       : Decimal    @mandatory;
      achievement  : Decimal;
      BonusTranche : Association to BonusTranche
}

entity BonusTranche : managed {
  key ID                        : UUID;
      name                      : String(50) @mandatory;
      description               : String;
      beginDate                 : DateTime   @mandatory;
      endDate                   : DateTime   @mandatory;
      dateOfOrigin              : DateTime   @mandatory;
      status                    : TrancheStatusEnum default 'Running';
      trancheWeight             : Decimal;
      participantCreationStatus : ParticipantCreationStatusEnum default 'InProcess';
      fiscalYear                : String;

      Target                    : Association to many Target
                                    on Target.BonusTranche = $self;
      trancheParticipation      : Association to many TrancheParticipation
                                    on trancheParticipation.bonusTranche = $self;
      Location                  : Association to Location;
}

entity Department {
  key ID    : UUID;
      name  : String;
      bonus : Decimal;
}

entity Employee {
  key ID                    : UUID;
      firstName             : String;
      lastName              : String;
      email                 : String;
      bonusPercentage       : Decimal;
      department            : Association to Department;
      trancheParticipattion : Association to many TrancheParticipation
                                on trancheParticipattion.participant = $self;
}

entity Attendance {
  key ID        : UUID;
      startDate : DateTime;
      endDate   : DateTime;
      employee  : Association to Employee
}

entity TrancheParticipation {
  key ID                     : UUID;
      calculatedPayoutAmount : Decimal;
      excluded               : Boolean default false;
      finalPayoutAmount      : Decimal;
      justification          : String;
      overRuled              : Boolean default false;
      participant            : Association to Employee;
      bonusTranche           : Association to BonusTranche
}
