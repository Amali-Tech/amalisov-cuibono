export interface CurrentView { currentView: "default" | "edit" | "create" }
export interface CurrentEditID { currentEditId: string }
export interface RouterArguments {
    "?query"?: { tab?: string, operation?: "default" | "edit" | "create", trancheId?: string };
}
export interface Tranche {
    ID: string
    name: string
    Location_ID: string
    description?: string
    beginDate: string
    dateOfOrigin: string
    endDate: string
    trancheWeight: string
    status: "Running" | "Locked" | "Completed"
    modifiedBy: string
    Target: Target[]
}
export interface Target {
    name: string
    achievement: number
    weight: number
    description?: string
}
export interface IFilterCondition {
    operator: string;
    values: unknown[]; // Depending on your data type, you can narrow this type.
}
export enum FilterItemName {
    SEARCH = "Search",
    STATUS = "status",
    LOCATION = "locationID",
    FISCAL = "fiscalYear"
}
export interface DialogInfo {
    title: string,
    label: string,
    searchValues: string
}

export class InitializationHelper {
    constructor(private getI18nText: (textPath: string) => string) { }
    /**
         * Provides the data for various dropdown menus used in the filter bar.
         * @public
         * @returns {object} An object containing the dropdown data.
         */
    public getdefaulTrancheData(): Tranche {
        return {
            ID: "",
            name: "",
            beginDate: "",
            endDate: "",
            dateOfOrigin: "",
            Location_ID: "",
            modifiedBy: "",
            status: "Running",
            trancheWeight: "",
            Target: [],
        }
    }
    public getDropdownData(): object {
        return {
            trancheStatus: [

                { key: "Running", text: this.getI18nText("running") },
                { key: "Locked", text: this.getI18nText("locked") },
                { key: "Completed", text: this.getI18nText("completed") },
            ],
            trancheLocation: [

                { key: "Ghana", text: this.getI18nText("accra") },
                { key: "Germany", text: this.getI18nText("germany") },
                { key: "Rwanda", text: this.getI18nText("rwanda") },
            ],
            fiscalYear: [
                { key: "2025", text: this.getI18nText("2025") },
                { key: "2024", text: this.getI18nText("2024") },
                { key: "2023", text: this.getI18nText("2023") },
                { key: "2022", text: this.getI18nText("2022") },
                { key: "2021", text: this.getI18nText("2021") },
                { key: "2020", text: this.getI18nText("2020") },
            ],
            excluded: [
                { key: "Yes", text: this.getI18nText("Yes") },
                { key: "No", text: this.getI18nText("No") }
            ]
        }
    }
}