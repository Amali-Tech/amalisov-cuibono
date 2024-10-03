import { Target } from "../../@cds-models/BonusTrancheService";

export default function validateInputTarget(targets: Target[]): boolean  {
  return targets.every(target => {
    return target.name && target.weight
  })
}