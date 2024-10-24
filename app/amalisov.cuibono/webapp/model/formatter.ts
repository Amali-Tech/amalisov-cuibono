import DateFormat from "sap/ui/core/format/DateFormat";

const Formatter = {
  formatButtonEnabled: (status: string): boolean => {
    return status !== "Completed";
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

  formatTruncatedId: function (sId: string): string {
    if (!sId) return "";
    
    return sId.substring(0, 8) + "...";
},


formatIdTooltip: function (sId: string): string {
    return sId || "";
},

formatSelectionMode: (status: string) => {
  return status === "Completed" ? "None" : "MultiSelect";
},
disableSelection: (status: string) => {
  return status === "Completed";
},
isSelectionEnabled: (status: string): boolean => {
  return status !== "Completed";
},

// New formatter for row styling based on status
formatRowSelectable: (status: string): string => {
  return status === "Completed" ? "disabledRow" : "";
}
};



export default Formatter;
