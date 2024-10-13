
import BaseController from "./BaseController";
import Fragment from "sap/ui/core/Fragment";
import View from "sap/ui/core/mvc/View";
import Dialog from "sap/m/Dialog";
import MessageToast from "sap/m/MessageToast";
import ComboBox from "sap/m/ComboBox";
import DatePicker from "sap/m/DatePicker";
import { CurrentView, InitializationHelper, Target, Tranche } from "../model/initialData";
import JSONModel from "sap/ui/model/json/JSONModel";
import { Route$MatchedEvent } from "sap/ui/core/routing/Route";
import Event from "sap/ui/base/Event";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
import Input from "sap/m/Input";
import ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";
import Context from "sap/ui/model/odata/v4/Context";
import CustomListItem from "sap/m/CustomListItem";

/**
 * @namespace amalisov.cuibono.controller
 */
export default class AddEditTranche extends BaseController {

    private _pDialog: Promise<Dialog> | undefined;
    private initialOdata: InitializationHelper;
    private _trancheData: Tranche
    private _currentEditTrancheID: string
    private _oEditContext: Context;
    public onInit(): void {
        this.initialOdata = new InitializationHelper(this.getI18nText.bind(this));
        this._trancheData = this.initialOdata.getdefaulTrancheData()
        this.getRouter()?.getRoute("RouteMain")?.attachPatternMatched(this.onRouteMatched, this);
        const oModel = new JSONModel(this.initialOdata.getDropdownData());
        this.getView()?.setModel(oModel, "dropdownModel");
        const oModelTranche = new JSONModel(this._trancheData);
        this.getView()?.setModel(oModelTranche, "trancheData");
    }
    public onSavePress() {
        const viewData: CurrentView = (this.getView()?.getModel("currentView") as JSONModel).getData()
        if (viewData.currentView && viewData.currentView === "create") {
            this.onCreatePress()
        } else if (viewData.currentView && viewData.currentView === "edit") {
            this.onEditTranche()
        }
    }
    public async onCreatePress(): Promise<void> {
        try {
            const trancheName = this.byId("trancheName") as Input;
            const trancheLocation = this.byId("trancheLocation") as ComboBox;
            //const trancheDescription = this.byId("trancheDescription") as TextArea;
            const beginDate = this.byId("beginDate") as DatePicker
            const endDate = this.byId("endDate") as DatePicker
            const originDate = this.byId("trancheOriginDate") as DatePicker
            const trancheWeight = this.byId("trancheWeight") as Input

            const trancheNameValue = trancheName.getValue();
            const trancheLocationValue = trancheLocation.getSelectedKey();
            //const trancheDescriptionValue = trancheDescription.getValue();
            const beginDateValue = beginDate.getDateValue();
            const endDateValue = endDate.getDateValue();
            const originDateValue = originDate.getDateValue();
            const trancheWeightValue = trancheWeight.getValue();

            // Validate inputs
            if (!trancheNameValue || !trancheLocationValue || !beginDateValue || !endDateValue || !trancheWeightValue) {
                MessageToast.show(this.getI18nText("fillInAllFields"));
                return;
            }

            const oModel = this.getView()?.getModel("trancheModel") as ODataModel;

            // Get the model and the current data for the Target array from the binding context
            const oNewTrancheModel = this.getView()?.getModel("trancheData");

            // Get the current tranche data object (including the Target array)
            const oTrancheData = oNewTrancheModel?.getObject("/") as Tranche;


            const newTranche: Partial<Tranche> = {
                name: trancheNameValue,
                Location_ID: trancheLocationValue,
                beginDate: this.formatDateWithoutTime(beginDateValue),
                endDate: this.formatDateWithoutTime(endDateValue),
                dateOfOrigin: this.formatDateWithoutTime(originDateValue),
                trancheWeight: trancheWeightValue,
                Target: oTrancheData.Target
            }

            const oBinding = oModel.bindList("/BonusTranche") as ODataListBinding;
            const oContext = oBinding.create(newTranche);

            // Wait for the creation to complete
            await oContext.created();

            // Show success message and navigate to the overview
            MessageToast.show(this.getI18nText("trancheCreateSuccess"));
            this.getRouter().navTo("RouteMain");
            oModel.refresh();
        }
        catch (error) {
            MessageToast.show(error + this.getI18nText("cannotCreateTranche"));
        }
        this.updateTotalWeightDisplay()
    }
    private formatDateWithoutTime(date: Date): string {
        const year = date.getFullYear();  // Full year, e.g., 2024
        const month = (`0${date.getMonth() + 1}`).slice(-2);  // Month is zero-indexed, so add 1 and ensure two digits
        const day = (`0${date.getDate()}`).slice(-2);  // Get day and ensure two digits

        return `${year}-${month}-${day}`;
    }
    public async onEditTranche(): Promise<void> {
        const trancheLocation = this.byId("trancheLocation") as ComboBox;
        const trancheLocationValue = trancheLocation.getSelectedKey();
        const oModel = this.getView()?.getModel("trancheModel") as ODataModel;

        // Get the model and the current data for the Target array from the binding context
        const oNewTrancheModel = this.getView()?.getModel("trancheData");

        // Get the current tranche data object (including the Target array)
        const oTrancheData = oNewTrancheModel?.getObject("/") as Tranche;

        const newTranche: Partial<Tranche> = {
            name: oTrancheData.name,
            Location_ID: trancheLocationValue,
            beginDate: this.formatDateWithoutTime(new Date(oTrancheData.beginDate)),
            endDate: this.formatDateWithoutTime(new Date(oTrancheData.endDate)),
            dateOfOrigin: this.formatDateWithoutTime(new Date(oTrancheData.dateOfOrigin)),
            trancheWeight: oTrancheData.trancheWeight,
            Target: oTrancheData.Target
        }

        oModel?.bindContext("/BonusTranche(...)")
            .setParameter("ID", this._currentEditTrancheID)
            .setParameter("content", newTranche)
            .invoke()
            .then(
                // successful submit
                () => {
                    oModel.refresh();
                    this.getRouter().navTo("RouteMain");
                    MessageToast.show(this.getI18nText("TrancheEditSuccess"));
                },
                // failure in submit
                (eer) => {
                    MessageToast.show(eer + this.getI18nText("trancheEditFailed"));
                }
            );
    }
    private onRouteMatched = (oEvent: Route$MatchedEvent): void => {
        const oArgs = oEvent.getParameter("arguments") as { "?query"?: { operation?: string; trancheId?: string } };
        const oQuery = oArgs["?query"];

        if (oQuery && oQuery.operation === "edit" && oQuery.trancheId) {
            this._currentEditTrancheID = oQuery.trancheId
            this._loadTrancheDetails(oQuery.trancheId);
        } else {
            this.updateModelData("trancheData", this.initialOdata.getdefaulTrancheData(), true)
        }
    };
    private _loadTrancheDetails(trancheId: string): void {

        // Get the OData V4 model
        const oModel = this.getView()?.getModel("trancheModel") as ODataModel
        const sBindingPath = `/BonusTranche('${trancheId}')`;
        // Create a context binding (without binding it to the view)
        const oContextBinding = oModel.bindContext(sBindingPath, undefined, { $expand: "Target" });

        // Fetch the data from the bound context
        oContextBinding.requestObject().then((oData: Tranche) => {
            const editTranche: Tranche = {
                name: oData.name,
                beginDate: oData.beginDate,
                dateOfOrigin: oData.dateOfOrigin,
                modifiedBy: oData.modifiedBy,
                status: oData.status,
                endDate: oData.endDate,
                Location_ID: oData.Location_ID,
                Target: oData.Target,
                trancheWeight: oData.trancheWeight,
                description: oData.description
            }
            this.updateModelData("trancheData", editTranche, true)

        }).catch(() => {
            MessageToast.show(this.getI18nText("FetchError"))
        });

    }
    public onAddTarget(): void {
        const oView = this.getView() as View;

        if (!this._pDialog) {
            this._pDialog = Fragment.load({
                id: oView.getId(),
                name: "amalisov.cuibono.view.fragment.createTarget",
                controller: this
            }).then((oDialog) => {
                if (!Array.isArray(oDialog) && oDialog instanceof Dialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                } else {
                    throw new Error(this.getI18nText("dialogNotLoaded"));
                }
            });
        }

        this._pDialog.then((oDialog) => {
            oDialog.open();
        }).catch(() => {

            MessageToast.show(this.getI18nText("errorDialog"))

        });
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
    public onCancelCreateTarget(): void {
        const oDialog = this.byId("createTargetDialog") as Dialog;
        if (oDialog) {
            oDialog.close();
        } else {
            //
            MessageToast.show(this.getI18nText("dialogNotFound"))

        }
    }
    public onCreateTarget() {
        // Get the new target details from the input fields
        const sTargetName = (this.byId("targetNameInput") as Input)?.getValue();
        const iTargetWeight = parseFloat((this.byId("targetWeightInput") as Input)?.getValue());
        const sTargetAchievement = (this.byId("targetAchievementInput") as Input)?.getValue();
        const sTargetDescription = (this.byId("targetDescriptionInput") as Input)?.getValue();

        // Get the model and the current data for the Target array from the binding context
        const oModel = this.getView()?.getModel("trancheData");

        // Get the current tranche data object (including the Target array)
        const oTrancheData = oModel?.getObject("/");


        // Add the new target entry to the Target array
        oTrancheData.Target.push({
            name: sTargetName,
            weight: iTargetWeight,
            achievement: sTargetAchievement,
            description: sTargetDescription
        });

        this.updateModelData("trancheData", oTrancheData)

        // // Update the model with the new data
        // oModel?.updateBindings();

        // Show a success message
        MessageToast.show("Target added successfully.");

        // Close the dialog
        this.onCancelCreateTarget();
    }
    public onEditTargetPress(oEvent: Event) {
        // Get the item and its binding context
        const oItem = <CustomListItem>oEvent.getSource();
        const oContext = oItem.getBindingContext("trancheData") as Context;

        // Save the binding context for later use (when saving the edits)
        this._oEditContext = oContext;

        // Open the edit dialog
        if (!this.byId("editTargetDialog")) {
            Fragment.load({
                id: this.getView()?.getId(),
                name: "amalisov.cuibono.view.fragment.editTarget", // replace with your fragment's path
                controller: this
            }).then(oDialog => {
                this.getView()?.addDependent(oDialog as Dialog);
                (oDialog as Dialog).bindElement({ path: oContext.getPath(), model: "trancheData" }); // Bind dialog to selected item
                (oDialog as Dialog).open();
            });
        } else {
            const oDialog = this.byId("editTargetDialog");
            (oDialog as Dialog).bindElement({ path: oContext.getPath(), model: "trancheData" });
            (oDialog as Dialog).open();
        }
        this.updateTotalWeightDisplay()
    }
    public onSaveEditTarget() {
        // Check if we have the context of the item being edited
        if (!this._oEditContext) {
            MessageToast.show("No target selected for editing.");
            return;
        }

        // Get the model and the tranche data
        const oModel = this.getView()?.getModel("trancheData");

        if (!oModel) {
            console.error("Model not found.");
            return;
        }

        // The data is already bound to the model, so changes will reflect automatically.
        // Just close the dialog and refresh the model binding to update the table.
        oModel.refresh();

        // Close the dialog
        (this.byId("editTargetDialog") as Dialog)?.close();

        // Show a success message
        MessageToast.show("Target updated successfully.");
    }
    public onCancelEditTarget(): void {
        const oDialog = this.byId("editTargetDialog") as Dialog;
        if (oDialog) {
            oDialog.close();
        }
    }
    public onDeleteTargetPress(oEvent: Event) {
        // Get the row/context binding where the delete button was pressed
        const oItem = <CustomListItem>oEvent.getSource(); // ColumnListItem or CustomListItem
        const oContext = oItem.getBindingContext("trancheData");
        // Ensure that oContext exists
        if (!oContext) {
            console.error("Binding context not found.");
            return;
        }
        // Get the model and the data
        const oModel = this.getView()?.getModel("trancheData");
        const oTrancheData = oModel?.getObject("/");
        const sPath = oContext.getPath();
        const iIndex = parseInt(sPath.split("/").pop() || "-1", 10);

        if (iIndex >= 0 && Array.isArray(oTrancheData?.Target)) {
            // Remove the selected target from the Target array
            oTrancheData.Target.splice(iIndex, 1);
            // Update the model with the new data
            oModel?.refresh(); // Refresh to update the UI bindings
            // Display a success message
            MessageToast.show("Target deleted successfully.");
        } else {
            console.error("Invalid index or Target array not found.");
        }
        this.updateTotalWeightDisplay()
    }
    private updateTotalWeightDisplay(): void {
        const totalWeight = this.calculateTotalTargetWeight();
        const oModel = this.getView()?.getModel("trancheData") as JSONModel;;
        if (oModel) {
            oModel?.setProperty("/totalWeight", totalWeight);
            oModel.refresh();
        }
    }
    private calculateTotalTargetWeight(): string {
        const oModel = this.getView()?.getModel("trancheData") as JSONModel;
        const oTrancheData: { Target: Target[] } = oModel?.getObject("/") || { Target: [] };
        let totalWeight = 0;
        if (Array.isArray(oTrancheData.Target)) {
            totalWeight = oTrancheData.Target.reduce((acc: number, target: Target) => {
                return acc + parseFloat(target.weight || "0"); // Calculate numerically while weights stay strings
            }, 0);
        }

        return totalWeight.toString();
    }
}