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

}

export default Formatter;

