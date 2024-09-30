namespace cuibono;

entity BonusTranche {
  key ID                   : UUID;
      name                 : String(50) not null;
      beginDate            : Date;
      endDate              : Date;
      status               : String;
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
      participant            : Association to Person;
      bonusTranche           : Association to BonusTranche
}

entity Target {
  key ID           : UUID;
      name         : String(50) not null;
      weight       : Decimal;
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
