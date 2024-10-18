export type DeleteParam = {
  ID: string;
};

export enum TrancheStatusEnum {
  RUNNING = "Running",
  LOCKED = "Locked",
  COMPLETED = "Completed",
}

export enum ParticipantCreationStatusEnum {
  InPROCESS = "InProcess",
  FAILED = "Failed",
  DONE = "Done",
}