namespace cuibono;

using {managed} from '@sap/cds/common';

entity BonusTranche: managed {
  key ID                   : UUID;
      name                 : String(50) not null @mandatory;
      beginDate            : DateTime @mandatory;
      endDate              : DateTime @mandatory;
      status               : String default 'Running';
      trancheWeight        : Decimal;
      Target               : Association to many Target
                              on Target.BonusTranche = $self;
      trancheParticipation : Association to many TrancheParticipation
                              on trancheParticipation.bonusTranche = $self;
      Location             : Association to Location;
}

entity TrancheParticipation {
  key ID                     : UUID;
      calculatedPayoutAmount : Decimal;
      excluded               : Boolean;
      finalPayoutAmount      : Decimal;
      justification          : String;
      overRuled              : Boolean;
      participant            : Association to Person;
      bonusTranche           : Association to BonusTranche
}

entity Target {
  key ID           : UUID;
      name         : String(50) not null @mandatory;
      weight       : Decimal @mandatory;
      achievement  : Decimal;
      BonusTranche : Association to BonusTranche
}

entity Person {
  key ID         : UUID;
      name       : String(50) not null;
      department : String
}

entity Location {
  key ID   : UUID;
      name : String(50) not null;
}
