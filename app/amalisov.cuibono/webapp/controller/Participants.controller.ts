
import Controller from "sap/ui/core/mvc/Controller";
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


/**
 * @namespace amalisov.cuibono.controller
 */
export default class Participants extends Controller {
   public  formatter = Formatter
   private _oSortDialog: Dialog | undefined;
   private _oOverrideDialog?: Dialog; 

    public onInit(): void {
        const oViewModel = new JSONModel({
            isSelectionActive: false
        });
        this.getView()?.setModel(oViewModel, "viewModel");

    }

    public onOpenSortParticipantDialog(): void {
        if (!this._oSortDialog) {
            this.loadFragment({
                name: "amalisov.cuibono.view.fragment.participantDialog" // Replace with the correct fragment path
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
        const oTable = this.byId("idTranchesTable2") as Table;
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
    const oTable = this.byId("idTranchesTable2") as Table;
    const aSelectedItems = oTable.getSelectedItems();
    const oSelectModel = this.getView()?.getModel("viewModel") as JSONModel;
    oSelectModel.setProperty("/isSelectionActive",  aSelectedItems.length > 0);

  
}

public async onSubmitOverride(): Promise<void> {
    try {
        const oTable = this.byId("idTranchesTable2") as Table;
       
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
            if (oTableBinding) {
             oTableBinding.refresh();
            }
        
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



 

    

    

    



}