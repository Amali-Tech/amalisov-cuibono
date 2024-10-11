export interface CurrentView { currentView: "default" | "edit" | "create" }
export interface RouterArguments {
    "?query"?: { tab?: string, operation?: "default" | "edit" | "create" };
}
export interface Tranche {
    name: string
    Location_ID: string
    description?: string
    beginDate: string
    dateOfOrigin: string
    endDate: string
    trancheWeight: string
    Target: Target[]
}
export interface Target {
    name: string
    achievement: string
    weight: number
    description?: string
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
            name: "",
            beginDate: "",
            endDate: "",
            dateOfOrigin: "",
            Location_ID: "",
            Target: [],
            trancheWeight: ""
        }
    }
    public getDropdownData(): object {
        return {
            trancheStatus: [

                { key: "running", text: this.getI18nText("running") },
                { key: "locked", text: this.getI18nText("locked") },
                { key: "completed", text: this.getI18nText("completed") },
            ],
            trancheLocation: [

                { key: "accra", text: this.getI18nText("accra") },
                { key: "germany", text: this.getI18nText("germany") },
                { key: "rwanda", text: this.getI18nText("rwanda") },
            ],
            fiscalYear: [
                { key: "2019", text: this.getI18nText("2019-2020") },
                { key: "2020", text: this.getI18nText("2020-2021") },
                { key: "2021", text: this.getI18nText("2021-2022") },
            ]
        }
    }
}