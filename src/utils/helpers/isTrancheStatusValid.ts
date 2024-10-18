export function isTrancheStatusValid(status: string): boolean {
    if (status === null) return false;
  
    const validStatusValues = ["Running", "Locked", "Completed"];
  
    const isValid = validStatusValues.includes(status);
  
    return isValid;
  }