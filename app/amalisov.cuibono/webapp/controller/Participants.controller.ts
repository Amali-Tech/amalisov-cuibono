import { Route$MatchedEvent } from "sap/ui/core/routing/Route";
import Formatter from "../model/formatter";
import Dialog from "sap/m/Dialog";
import Control from "sap/ui/core/Control";
import MessageBox from "sap/m/MessageBox";
import Sorter from "sap/ui/model/Sorter";
import Table from "sap/m/Table";
import ListBinding from "sap/ui/model/ListBinding";
import ViewSettingsItem from "sap/m/ViewSettingsItem";
import Event from "sap/ui/base/Event";
import MessageToast from "sap/m/MessageToast";
import JSONModel from "sap/ui/model/json/JSONModel";
import Fragment from "sap/ui/core/Fragment";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
import ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";
import Input from "sap/m/Input";
import TextArea from "sap/m/TextArea";
import VBox from "sap/m/VBox";
import BaseController from "./BaseController";
import { DialogInfo, InitializationHelper, RouterArguments } from "../model/initialData";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import FilterItem from "sap/ui/comp/filterbar/FilterItem";
import ComboBox from "sap/m/ComboBox";
import MultiComboBox from "sap/m/MultiComboBox";
import MultiInput from "sap/m/MultiInput";
import ValueHelpDialog from "sap/ui/comp/valuehelpdialog/ValueHelpDialog";

import Token from "sap/m/Token";
import FilterBar from "sap/ui/comp/filterbar/FilterBar";


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
  
   private _oSortDialog: Dialog | undefined;
   private _oOverrideDialog?: Dialog; 

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
        const oViewModel = new JSONModel({
            isSelectionActive: false
        });
        this.getView()?.setModel(oViewModel, "viewModel");

    }

    private onRouteMatched = (oEvent: Route$MatchedEvent): void => {
        const oArgs = oEvent.getParameter("arguments") as RouterArguments;
        const sTrancheId: string = oArgs["?query"]?.trancheId || "";
        if (oArgs["?query"]?.tab === "participants" && sTrancheId) {
            this.currentTrancheId = sTrancheId
            this.filterDueToTrancheId()
        }
    };

    public onOpenSortParticipantDialog(): void {
        if (!this._oSortDialog) {
            this.loadFragment({
                name: "amalisov.cuibono.view.fragment.participantDialog" 
            }).then((dialog: Control | Control[]) => {
                // Properly cast the result to Dialog
                const oDialog = Array.isArray(dialog) ? dialog[0] as Dialog : dialog as Dialog;
                this._oSortDialog = oDialog;
                this._oSortDialog.open();
            }).catch((err) => {
                MessageBox.show(err + "faileToLoad");
            });
        } else {
            this._oSortDialog.open();
        }
    }
    

   

    public onSortParticipant(oEvent: Event): void {
        const oTable = this.byId("idParticipantTable2") as Table;
        if (!oTable) {
            MessageBox.error("The table component is not available.");
            return;
        }
    
        const oBinding = oTable.getBinding("items") as ListBinding;
    
        const oSortItem = oEvent.getParameter("sortItem" as never) as ViewSettingsItem;
        const sSortKey = oSortItem.getKey();
        const bDescending = oEvent.getParameter("sortDescending" as never) as boolean;
    
        let oSorter: Sorter | undefined;
    
        switch (sSortKey) {
            case "sortName":
                oSorter = new Sorter("bonusTranche/name", bDescending); // Sorting by first name
                break;
            case "sortLocation":
                oSorter = new Sorter("bonusTranche/Location/name", bDescending); // Sorting by location
                break;
            case "sortStatus":
                oSorter = new Sorter("bonusTranche/status", bDescending); // Sorting by tranche status
                break;
            case "sortFullName":
                oSorter = new Sorter("participant/firstName", bDescending); // Sorting by full name (first + last)
                break;
            case "sortDepartment":
                oSorter = new Sorter("participant/department/name", bDescending); // Sorting by department
                break;
            default:
                MessageBox.show("invalidCriteria");
                return;
        }
    
        if (oSorter) {
            oBinding.sort([oSorter]);
        }
    }
    
    

      
      public onSortOrderChange(): void {
       
    }
    

    public onSortDialogClose(): void {
        this._oSortDialog?.destroy(); 
        this._oSortDialog = undefined; 
    }
    
 
    public onSortCancel(): void {
        this._oSortDialog?.close(); 
}

public onOpenOverrideDialog(): void {
    if (!this._oOverrideDialog) {
        Fragment.load({
            name: "amalisov.cuibono.view.fragment.overruleAmountDialog",
            controller: this
        }).then((oDialog: Control | Control[]) => {
            this._oOverrideDialog = (Array.isArray(oDialog) ? oDialog[0] : oDialog) as Dialog;
            this.getView()?.addDependent(this._oOverrideDialog);
            this._oOverrideDialog.open();
        });
    } else {
        this._oOverrideDialog.open();
    }
}

public onSelectionChange(): void {
    const oTable = this.byId("idParticipantTable2") as Table;
   
    const aSelectedItems = oTable.getSelectedItems();
    const oSelectModel = this.getView()?.getModel("viewModel") as JSONModel;
    oSelectModel.setProperty("/isSelectionActive",  aSelectedItems.length > 0);

  
}

public async onSubmitOverride(): Promise<void> {
    try {
        const oTable = this.byId("idParticipantTable2") as Table;
       
        const aSelectedItems = oTable.getSelectedItems();
        

        const aTrancheIds = aSelectedItems
            .map(item => item.getBindingContext("trancheModel")?.getProperty("ID"))
            .filter((id): id is string => !!id);

        // Correctly type the dialog content
        const oDialogContent = this._oOverrideDialog?.getContent()[0] as VBox;
        

        // Properly cast the controls
        const aItems = oDialogContent.getItems();
        const sAmount = aItems[0] as Input;
        const sJustification = aItems[1] as TextArea;

        const sAmountValue = sAmount.getValue();
        const sJustificationValue = sJustification.getValue();

        if (!sAmountValue || !sJustificationValue) {
            MessageToast.show("Please provide both amount and justification.");
            return;
        }

        // Validate amount is a valid number
        const fAmount = parseFloat(sAmountValue);
        if (isNaN(fAmount)) {
            MessageToast.show("Please enter a valid amount.");
            return;
        }
        
        const oPayload = {
            participants: aTrancheIds,
            justification: sJustificationValue,
            amount: fAmount
        };

        const oModel = this.getView()?.getModel("trancheModel") as ODataModel;
        
       

        try {
            // Type-safe binding creation
            const oBinding = oModel.bindList("/overruleParticipant") as ODataListBinding;
            
            // Execute the create operation
             oBinding.create(oPayload);
            
            MessageToast.show("Amount overridden successfully.");
            this._oOverrideDialog?.close();
            
            // Clear the inputs after successful submission
            sAmount.setValue("");
            sJustification.setValue("");
            
            // Refresh the table with type-safe binding
            const oTableBinding = oTable.getBinding("items") as ODataListBinding;
           
             oTableBinding.refresh();
            
        
        } catch (error) {
            MessageBox.error(error + "Failed to override amounts");
        }

    } catch (error) {
        MessageBox.error(error + "Unexpected error occurred: ");
    }
}

public onCancelOverride(): void {
    this._oOverrideDialog?.close();
}



   
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

                sValue = this.getControlValue(oControl, oItem)

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
    private getControlValue(oControl: Control, oItem: FilterItem): string | string[] | null {
        // Check if the control is a MultiComboBox and get selected keys
        if ((oControl as ComboBox).getSelectedKey && (oControl as ComboBox).getSelectedKey() && oItem.getName() === "fiscalYear") {
            const fiscalYear = (oControl as ComboBox).getSelectedKey();
            const [startYear, endYear] = fiscalYear.trim().split('-').map(year => parseInt(year, 10));

            const startDate = new Date(startYear, 9, 22);
            const endDate = new Date(endYear, 9, 22);

            return [startDate.toISOString().split("T")[0], endDate.toISOString().split("T")[0]];
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
                return "fiscal";
            case "localID":
                return "participant/ID";
            case "participantName":
                return "participant/firstName";
            case "department":
                return "participant/department";
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
                this._oDialog = oDialog as ValueHelpDialog;
                this.getView()?.addDependent(this._oDialog);
                this._oDialog.open();
            }).catch(() => {
                this.messageShow("Error loading fragment")
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
}