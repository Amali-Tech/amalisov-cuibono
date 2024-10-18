import { TrancheStatusEnum } from "../types/api";

export function isTrancheStatusValid(status: string): boolean {
  if (status === null) return false;

  const validStatusValues = [
    TrancheStatusEnum.RUNNING,
    TrancheStatusEnum.LOCKED,
    TrancheStatusEnum.COMPLETED,
  ] as string[];

  const isValid = validStatusValues.includes(status);

  return isValid;
}