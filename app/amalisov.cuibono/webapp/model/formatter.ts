import DateFormat from "sap/ui/core/format/DateFormat";

const Formatter = {
    formatButtonEnabled: (status: string): boolean => {
        return status !== "Locked" && status !== "Completed";
    },

    formatDate: (date: string): string => {
        if (!date) {
            return "";
        }
        const oDateFormat = DateFormat.getDateInstance({
            pattern: "MMMM d, yyyy"
        });
        return oDateFormat.format(new Date(date));
    },

   formatTextClass(weight: string): string {
        const totalWeight = parseFloat(weight || "0");
        return totalWeight === 100 ? "totalWeightGreen" : "totalWeightRed";
    },

    formatIconColorClass(weight: string): string {
        const totalWeight = parseFloat(weight || "0");
        return totalWeight === 100 ? "iconGreen" : "iconRed";
    },

    formatIconVisibility(weight: string): boolean {
        const totalWeight = parseFloat(weight || "0");
        return totalWeight !== 100; // Show the icon only if the weight is not 100
    }

}

export default Formatter;

