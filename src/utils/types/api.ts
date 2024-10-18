export type DeleteParam = {
  ID: string;
};

export const enum TrancheStatusEnum {
  RUNNING = "Running",
  LOCKED = "Locked",
  COMPLETED = "Completed",
}

export const enum ParticipantCreationStatusEnum {
  InPROCESS = "InProcess",
  FAILED = "Failed",
  DONE = "Done",
}