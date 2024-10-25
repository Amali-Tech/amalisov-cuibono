import { Route$MatchedEvent } from "sap/ui/core/routing/Route";
import Formatter from "../model/formatter";
import BaseController from "./BaseController";
import { DialogInfo, InitializationHelper, RouterArguments, Tranche } from "../model/initialData";
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
import Fragment from "sap/ui/core/Fragment";
import Token from "sap/m/Token";
import Dialog from "sap/m/Dialog";
import TextArea from "sap/m/TextArea";
import Event from "sap/ui/base/Event";
import Control from "sap/ui/core/Control";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";

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
    private _oCurrentMultiInput: MultiInput;
    private _oDialogExclude: Dialog | null = null;


    public onInit(): void {
        this.initialOdata = new InitializationHelper(this.getI18nText.bind(this));
        this.getRouter().getRoute("RouteMain")?.attachMatched(this.onRouteMatched, this);
        this._oTable1 = this.byId("idPartcipantTable2") as Table;
        this._oFilterBar = this.byId("participantFilterbar") as FilterBar;
        const oModel = new JSONModel(this.initialOdata.getDropdownData());
        this.getView()?.setModel(oModel, "dropdownModel");
        const oDialogModel = new JSONModel({
            title: this.getI18nText("filterbyvalue"),
            label: this.getI18nText("entervalues"),
            searchValues: ""
        } as DialogInfo);
        this.getView()?.setModel(oDialogModel, "dialogInfo");
    }

    private onRouteMatched = (oEvent: Route$MatchedEvent): void => {
        const oArgs = oEvent.getParameter("arguments") as RouterArguments;
        const sTrancheId: string = oArgs["?query"]?.trancheId || "";
        if (oArgs["?query"]?.tab === "participants" && sTrancheId) {
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
                let sValue: string | string[] | Date[] | boolean[] | null = "";
                let sPath: string = "";
                const sOperator: FilterOperator = FilterOperator.Contains;

                sValue = this.getControlValue(oControl, oItem)

                if (
                    sValue &&
                    ((Array.isArray(sValue) && sValue.length > 0) ||
                        (!Array.isArray(sValue) && sValue !== null))
                ) {
                    sPath = this.getPathName(oItem);

                    if (sPath) {

                        if (!Array.isArray(sValue) && oItem.getName() === "fiscalYear") {
                            aFilters.push(new Filter(sPath, FilterOperator.EQ, sValue))
                        }
                        else if (Array.isArray(sValue) && oItem.getName() === "participantName") {
                            // Create filters for other array values
                            const combinedFilters: Filter[] = []
                            sValue.forEach((val) => {

                                combinedFilters.push(new Filter({ path: "participant/firstName", operator: sOperator, value1: val, caseSensitive: false }));
                                combinedFilters.push(new Filter({ path: "participant/lastName", operator: sOperator, value1: val, caseSensitive: false }));

                            });
                            const oCombinedFilter = new Filter({
                                filters: combinedFilters,
                                and: false // "and: false" ensures it's an OR condition
                            });
                            aFilters.push(oCombinedFilter);
                        }
                        else if (Array.isArray(sValue) && oItem.getName() === "excluded") {
                            // Create filters for other array values
                            sValue.forEach((val) => {
                                aFilters.push(new Filter({ path: sPath, operator: FilterOperator.EQ, value1: val }));
                            });
                        }
                        else if (Array.isArray(sValue)) {
                            // Create filters for other array values

                            sValue.forEach((val) => {
                                aFilters.push(new Filter({ path: sPath, operator: sOperator, value1: val, caseSensitive: false }));
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
    private getControlValue(oControl: Control, oItem: FilterItem): string | string[] | boolean[] | null {
        // Check if the control is a MultiComboBox and get selected keys
        if ((oControl as ComboBox).getSelectedKey && (oControl as ComboBox).getSelectedKey() && oItem.getName() === "fiscalYear") {
            const fiscalYear = (oControl as ComboBox).getSelectedKey();
            return fiscalYear
        }
        else if (
            (oControl as MultiComboBox).getSelectedKeys && oItem.getName() === "excluded"
        ) {
            const values: boolean[] = [];
            (oControl as MultiComboBox).getSelectedKeys().forEach((oItem) => {
                if (oItem === "Yes") {
                    values.push(true)
                } else {
                    values.push(false)
                }
            })
            return values
        }
        else if (
            (oControl as MultiComboBox).getSelectedKeys
        ) {
            return (oControl as MultiComboBox).getSelectedKeys();

        } else if ((oControl as MultiInput).getTokens && (oControl as MultiInput).getTokens().length) {
            if ((oControl as MultiInput).getTokens().length) {
                const tokenTexts: string[] = []
                const tokens = (oControl as MultiInput).getTokens()
                tokens.forEach(item => { tokenTexts.push(item.getText()) })
                return tokenTexts
            }
        }
        else {
            return null
        } return null
    }
    private getPathName(oItem: FilterItem): string {
        switch (oItem.getName()) {
            case "status":
                return "bonusTranche/status";
            case "location":
                return "bonusTranche/Location_ID";
            case "fiscalYear":
                return "bonusTranche/fiscalYear";
            case "localID":
                return "participant/ID";
            case "participantName":
                return "participant/firstName";
            case "department":
                return "participant/department/name";
            case "trancheName":
                return "bonusTranche/name";
            case "excluded":
                return "excluded";
            default:
                return "";
        }
    }

    // Event handler for valueHelpRequest on the MultiInput
    public onDialogRequested(oEvent: Event): void {
        const oSourceControl = oEvent.getSource() as MultiInput;
        // Get the control's id or name to determine the title
        const sFieldName = oSourceControl.getName();  // Could also use getId() if you prefer

        // Determine the title based on the field name
        let sDialogTitle: string;  // Default title
        let fieldLabel: string;
        if (sFieldName === "localId") {
            sDialogTitle = this.getI18nText("byLocalID");
            fieldLabel = this.getI18nText("localIDLabel")

        } else if (sFieldName === "participantName") {
            sDialogTitle = this.getI18nText("byParticipant");
            fieldLabel = this.getI18nText("participantLabel")
        }
        else if (sFieldName === "department") {
            sDialogTitle = this.getI18nText("bydepartment");
            fieldLabel = this.getI18nText("departmentLabel")
        } else if (sFieldName === "trancheName") {
            sDialogTitle = this.getI18nText("byTrancheName");
            fieldLabel = this.getI18nText("trancheNameLabel")
        } else {
            sDialogTitle = ""
            fieldLabel = ""
        }
        if (sDialogTitle && fieldLabel) {
            this.updateModelData("dialogInfo", { title: sDialogTitle, label: fieldLabel, searchValues: "" } as DialogInfo)
        }
        // Store the reference to the MultiInput that triggered the dialog
        this._oCurrentMultiInput = oSourceControl;
        if (!this._oDialog) {
            // Load the fragment asynchronously
            Fragment.load({
                id: this.getView()?.getId(),
                name: "amalisov.cuibono.view.fragment.LocalID",  // Update the path to your fragment
                controller: this
            }).then((oDialog) => {
                this._oDialog = oDialog as Dialog;
                this.getView()?.addDependent(this._oDialog);
                this._oDialog.open();
            }).catch(() => {
                this.messageShow("Errorloadingfragment")
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

        if (sInputValue && this._oCurrentMultiInput) {
            // Split the input by commas and trim any extra spaces
            const aValues = sInputValue.split(",").map(id => id.trim());

            // Clear existing tokens in the MultiInput
            this._oCurrentMultiInput.setTokens([]);

            // Add new tokens to MultiInput for each value
            aValues.forEach((value: string) => {
                if (value) {
                    this._oCurrentMultiInput.addToken(new Token({
                        key: value,
                        text: value
                    }));
                }
            });
        }

        // Close the dialog
        this._oDialog!.close();
    }
    private updateModelData(
        modelName: string,
        data: object,
        refresh?: boolean
    ): void {
        const model = this.getView()?.getModel(modelName) as JSONModel;
        model.setData(data);
        if (refresh) {
            model.refresh();
        }
    }

    // Event handler when the "Cancel" button is pressed in ValueHelpDialog
    public onDialogCancelPress(): void {
        this._oDialog!.close();
    }
    private messageShow = (error: string): void => {
        MessageToast.show(this.getI18nText(error));
    };
    public onExcludePress(): void {
        if (!this._oDialogExclude) {
            // Load the fragment asynchronously
            Fragment.load({
                id: this.getView()?.getId(),
                name: "amalisov.cuibono.view.fragment.excludeParticipant",  // Update the path to your fragment
                controller: this
            }).then((oDialog) => {
                this._oDialogExclude = oDialog as Dialog;
                this.getView()?.addDependent(this._oDialogExclude);
                this._oDialogExclude.open();
            }).catch(() => {
                this.messageShow("Errorloadingfragment")
            });
        } else {
            this._oDialogExclude.open();
        }
    }
    public onExcludeDialogCancelPress(): void {
        this._oDialogExclude!.close();
    }
    public onExcludeDialogOkPress(): void {
        const oTextField = this.byId("justificationMessage") as TextArea
        const oModel = this.getView()?.getModel("trancheModel") as ODataModel;
        const oSelecteditems = this._oTable1.getSelectedItems()
        const trancheParticipationIDs: string[] = []
        const justificationMessage: string = oTextField.getValue()
        if (!justificationMessage) {
            this.messageShow("justificationEmpty")
            return
        }
        oSelecteditems.forEach((oItem) => {
            const oContext = oItem.getBindingContext("trancheModel");
            const oData = oContext?.getObject() as Tranche;
            trancheParticipationIDs.push(oData.ID)
        })
        const sBindingPath = '/excludeParticipants(...)';
        oModel?.bindContext(sBindingPath)
            .setParameter('trancheParticipationIds', trancheParticipationIDs)
            .setParameter('justification', justificationMessage)
            .invoke().then(() => {
                oModel.refresh();
                this.messageShow("excludeSuccess")
                this.onExcludeDialogCancelPress()
            })
            .catch(() => {
                this.messageShow("excludeFailed")
            });
    }
}