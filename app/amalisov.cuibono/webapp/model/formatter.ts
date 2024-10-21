import DateFormat from "sap/ui/core/format/DateFormat";

const Formatter = {
  formatButtonEnabled: (status: string): boolean => {
    return status !== "completed";
  },

  formatCompleteVisibility: (status: string, totalWeight: number): boolean => {

    return (
      (status === "Locked" || status === "Completed") && totalWeight === 100
    );
  },

  formatSaveVisibility: (status: string): boolean => {
    return status === "Running";
  },

  formatLockedVisibility: (status: string, totalWeight: number): boolean => {
    return (status === "Running" || status === "Open") && totalWeight === 100;
  },

  formatDate: (date: string): string => {
    if (!date) {
      return "";
    }
    const oDateFormat = DateFormat.getDateInstance({
      pattern: "MMMM d, yyyy",
    });
    return oDateFormat.format(new Date(date));
  },

  formatTextClass(totalWeight: number): string {
   
    return totalWeight === 100 ? "totalWeightGreen" : "totalWeightRed";
},

formatNullValue: (value: string | null) => {
  return value ? value : "-"; 
},


  formatIconColorClass(totalWeight: number): string {
    return totalWeight === 100 ? "iconGreen" : "iconRed";
  },

  formatIconVisibility(totalWeight: number): boolean {
    return totalWeight > 100;
  },

  formatPercentage: (value: number): string => {
    if (value == null) {
      return "";
    }

    const percentage = value + "%";

    return percentage;
  },
};

export default Formatter;
