import { Route$MatchedEvent } from "sap/ui/core/routing/Route";
import Formatter from "../model/formatter";
import BaseController from "./BaseController";
import { InitializationHelper, RouterArguments } from "../model/initialData";
import MessageToast from "sap/m/MessageToast";
import Table from "sap/m/Table";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import ListBinding from "sap/ui/model/ListBinding";
import JSONModel from "sap/ui/model/json/JSONModel";
import FilterItem from "sap/ui/comp/filterbar/FilterItem";
import FilterBar from "sap/ui/comp/filterbar/FilterBar";
import ComboBox from "sap/m/ComboBox";
import MultiComboBox from "sap/m/MultiComboBox";
import MultiInput from "sap/m/MultiInput";
import ValueHelpDialog from "sap/ui/comp/valuehelpdialog/ValueHelpDialog";
import Fragment from "sap/ui/core/Fragment";
import Token from "sap/m/Token";
import Dialog from "sap/m/Dialog";
import TextArea from "sap/m/TextArea";

/**
 * @namespace amalisov.cuibono.controller
 */
export default class Participants extends BaseController {
    public formatter = Formatter
    public currentTrancheId: string = ""
    private _oTable1: Table;
    private initialOdata: InitializationHelper;
    private _oFilterBar: FilterBar;
    private _oDialog: Dialog | null = null;


    public onInit(): void {
        this.initialOdata = new InitializationHelper(this.getI18nText.bind(this));
        this.getRouter().getRoute("RouteMain")?.attachMatched(this.onRouteMatched, this);
        this._oTable1 = this.byId("idPartcipantTable2") as Table;
        this._oFilterBar = this.byId("participantFilterbar") as FilterBar;
        const oModel = new JSONModel(this.initialOdata.getDropdownData());
        this.getView()?.setModel(oModel, "dropdownModel");
    }

    private onRouteMatched = (oEvent: Route$MatchedEvent): void => {
        const oArgs = oEvent.getParameter("arguments") as RouterArguments;
        const sTrancheId: string = oArgs["?query"]?.trancheId || "";
        if (oArgs["?query"]?.tab === "participants" && sTrancheId) {
            this.currentTrancheId = sTrancheId
            this.filterDueToTrancheId()
        }
        else if (oArgs["?query"]?.tab === "participants" && !sTrancheId) {
            this.currentTrancheId = sTrancheId
            this.filterDueToTrancheId()
        }
    };
    private filterDueToTrancheId() {
        // Apply filters to the table binding
        const filter = new Filter("bonusTranche_ID", FilterOperator.EQ, this.currentTrancheId)
        if (this._oTable1 && this._oTable1.getBinding) {
            const oBinding = this._oTable1.getBinding("items") as ListBinding;
            if (oBinding) {
                oBinding.filter(filter);
            }
        } else {
            this.messageShow("tableBinding"); // Show error if table binding fails
        }
    }
    public onSearchParticipants(): void {

        // Initialize an array to hold the filters
        const aFilters: Filter[] = [];
        // Get all filter items, including hidden ones
        const aFilterItems: FilterItem[] = this._oFilterBar.getAllFilterItems(true);

        aFilterItems.forEach((oItem) => {
            const oControl = oItem.getControl();
            if (oControl) {
                let sValue: string | string[] | Date[] | null = "";
                let sPath: string = "";
                const sOperator: FilterOperator = FilterOperator.Contains;

                // Check if the control is a MultiComboBox and get selected keys
                if ((oControl as ComboBox).getSelectedKey && (oControl as ComboBox).getSelectedKey() && oItem.getName() === "fiscalYear") {
                    const fiscalYear = (oControl as ComboBox).getSelectedKey();
                    const [startYear, endYear] = fiscalYear.trim().split('-').map(year => parseInt(year, 10));

                    // Generate the start and end dates dynamically (e.g., 22 October for both years)
                    const startDate = new Date(startYear, 9, 22);  // October is month 9 (0-based index)
                    const endDate = new Date(endYear, 9, 22);      // October for the end year

                    // Use the dynamically generated dates (formatted as "YYYY-MM-DD")
                    sValue = [startDate.toISOString().split("T")[0], endDate.toISOString().split("T")[0]];
                }
                else if (
                    (oControl as MultiComboBox).getSelectedKeys
                ) {
                    sValue = (oControl as MultiComboBox).getSelectedKeys();

                } else if ((oControl as MultiInput).getTokens && (oControl as MultiInput).getTokens().length) {
                    if ((oControl as MultiInput).getTokens().length) {
                        const tokenTexts: string[] = []
                        const tokens = (oControl as MultiInput).getTokens()
                        tokens.forEach(item => { tokenTexts.push(item.getText()) })
                        sValue = tokenTexts
                    }
                }
                else {
                    sValue = null
                }

                if (
                    sValue &&
                    ((Array.isArray(sValue) && sValue.length > 0) ||
                        (!Array.isArray(sValue) && sValue !== null))
                ) {
                    sPath = this.getPathName(oItem);
                    if (sPath) {

                        if (Array.isArray(sValue) && oItem.getName() === "fiscalYear") {
                            aFilters.push(new Filter("bonusTranche/beginDate", FilterOperator.GE, sValue[0]))
                            aFilters.push(new Filter("bonusTranche/endDate", FilterOperator.LE, sValue[1]))
                        }
                        else if (Array.isArray(sValue)) {
                            // Create filters for other array values

                            sValue.forEach((val) => {
                                aFilters.push(new Filter(sPath, sOperator, val));
                            });

                        } else {
                            // Create filters for other single values
                            aFilters.push(new Filter({ path: sPath, operator: sOperator, value1: sValue, caseSensitive: false }));
                        }
                    }
                }
            }
        })

        // Apply filters to the table binding
        if (this._oTable1 && this._oTable1.getBinding) {
            const oBinding = this._oTable1.getBinding("items") as ListBinding;
            if (oBinding) {
                oBinding.filter(aFilters);
            }
        } else {
            this.messageShow("tableBinding"); // Show error if table binding fails
        }
    }
    private getPathName(oItem: FilterItem): string {
        switch (oItem.getName()) {
            case "status":
                return "bonusTranche/status";
            case "location":
                return "bonusTranche/Location_ID";
            case "fiscalYear":
                return "fiscal";
            case "localID":
                return "participant/ID";
            case "participantName":
                return "participant/firstName";
            case "department":
                return "department/name";
            case "trancheName":
                return "bonusTranche/name";
            case "excluded":
                return "excluded";
            default:
                return "";
        }
    }
    // Event handler for valueHelpRequest on the MultiInput
    public onDialogRequested(): void {
        //const oSourceControl = oEvent.getSource() as MultiInput;
        if (!this._oDialog) {
            // Load the fragment asynchronously
            Fragment.load({
                id: this.getView()?.getId(),
                name: "amalisov.cuibono.view.fragment.LocalID",  // Update the path to your fragment
                controller: this
            }).then((oDialog) => {
                this._oDialog = oDialog as ValueHelpDialog;
                this.getView()?.addDependent(this._oDialog);
                this._oDialog.open();
            }).catch((oError) => {
                console.error("Error loading fragment:", oError);
            });
        } else {
            this._oDialog.open();
        }
    }
    // Event handler when the "OK" button is pressed in ValueHelpDialog
    public onDialogOkPress(): void {
        // Get the entered value from the TextArea
        const oTextArea = this.byId("localIdInputArea") as TextArea;
        const sInputValue = oTextArea.getValue().trim();

        if (sInputValue) {
            // Split the input by commas and trim any extra spaces
            const aLocalIDs = sInputValue.split(",").map(id => id.trim());

            // Reference to the MultiInput field
            const oMultiInput = this.byId("multiInputGLocalId") as MultiInput;

            // Clear existing tokens in the MultiInput
            oMultiInput.setTokens([]);

            // Add new tokens to MultiInput for each local ID
            aLocalIDs.forEach((localID: string) => {
                if (localID) {
                    oMultiInput.addToken(new Token({
                        key: localID,
                        text: localID
                    }));
                }
            });
        }

        // Close the dialog
        this._oDialog!.close();
    }
    // Event handler when the "Cancel" button is pressed in ValueHelpDialog
    public onDialogCancelPress(): void {
        this._oDialog!.close();
    }
    private messageShow = (error: string): void => {
        MessageToast.show(this.getI18nText(error));
    };
}