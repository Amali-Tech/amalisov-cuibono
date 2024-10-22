import BaseController from "./BaseController";
import Fragment from "sap/ui/core/Fragment";
import View from "sap/ui/core/mvc/View";
import Dialog from "sap/m/Dialog";
import MessageToast from "sap/m/MessageToast";
import ComboBox from "sap/m/ComboBox";
import DatePicker from "sap/m/DatePicker";
import { InitializationHelper, RouterArguments, Target, Tranche } from "../model/initialData";
import JSONModel from "sap/ui/model/json/JSONModel";
import { Route$MatchedEvent } from "sap/ui/core/routing/Route";
import Event from "sap/ui/base/Event";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
import Input from "sap/m/Input";
import ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";
import Context from "sap/ui/model/odata/v4/Context";
import CustomListItem from "sap/m/CustomListItem";
import Formatter from "../model/formatter";
import TextArea from "sap/m/TextArea";

/**
 * @namespace amalisov.cuibono.controller
 */
export default class AddEditTranche extends BaseController {
    public formatter = Formatter;
    private _pDialog: Promise<Dialog> | undefined;
    private initialOdata: InitializationHelper;
    private _trancheData: Tranche
    private _oEditContext: Context;
    private currentOperation: "edit" | "create" | null = null
    private targetCurrentOperation: "edit" | "create"

    public onInit(): void {
        this.initialOdata = new InitializationHelper(this.getI18nText.bind(this));
        this._trancheData = this.initialOdata.getdefaulTrancheData()
        this.getRouter()?.getRoute("AddEditTranche")?.attachPatternMatched(this.onRouteMatched, this);
        const oModel = new JSONModel(this.initialOdata.getDropdownData());
        this.getView()?.setModel(oModel, "dropdownModel");
        const oModelTranche = new JSONModel(this._trancheData);
        this.getView()?.setModel(oModelTranche, "trancheData");
        const currentView = new JSONModel({ currentView: "create" });
        this.getView()?.setModel(currentView, "currentView");
    }
    private onRouteMatched = (oEvent: Route$MatchedEvent): void => {
        const oArgs = oEvent.getParameter("arguments") as RouterArguments;
        const oQuery = oArgs["?query"];

        if (oQuery && oQuery.operation === "edit" && oQuery.trancheId) {
            this.currentOperation = "edit"
            this.updateModelData("currentView", { currentView: "edit" })
            this._loadTrancheDetails(oQuery.trancheId);
        } else if (oQuery && oQuery.operation === "create" && oQuery.trancheId) {
            this.currentOperation = "create"
            this._duplicateTranche(oQuery.trancheId);
        } else if (oQuery && oQuery.operation === "create") {
            this.currentOperation = "create"
            this.updateModelData("currentView", { currentView: "create" })
            this.updateModelData("trancheData", this.initialOdata.getdefaulTrancheData(), true)
        } else {
            this.messageShow("LoadingError")
        }
    };
    public onSavePress() {
        if (this.currentOperation === "create") {
            this.onCreatePress()
        } else if (this.currentOperation === "edit") {
            this.onEditTranche()
        }
    }

    public async onCreatePress(): Promise<void> {
        try {
            const trancheName = this.byId("trancheName") as Input;
            const trancheLocation = this.byId("trancheLocation") as ComboBox;
            const trancheDescription = this.byId("trancheDescription") as TextArea;
            const beginDate = this.byId("beginDate") as DatePicker;
            const endDate = this.byId("endDate") as DatePicker;
            const originDate = this.byId("trancheOriginDate") as DatePicker;
            const trancheWeight = this.byId("trancheWeight") as Input;

            const trancheNameValue = trancheName.getValue();
            const trancheLocationValue = trancheLocation.getSelectedKey();
            const trancheDescriptionValue = trancheDescription.getValue();
            const beginDateValue = beginDate.getDateValue();
            const endDateValue = endDate.getDateValue();
            const originDateValue = originDate.getDateValue();
            const trancheWeightValue = trancheWeight.getValue();

            // Validate inputs
            if (!trancheNameValue) {
                this.messageShow("trancheNameRequired")
                return;
            }

            if (!trancheLocationValue) {
                this.messageShow("trancheLocationRequired")
                return;
            }

            if (!beginDateValue) {
                MessageToast.show(this.getI18nText("beginDateRequired"));
                return;
            }

            if (!endDateValue) {
                MessageToast.show(this.getI18nText("endDateRequired"));
                return;
            }

            const totalWeight = this.calculateTotalTargetWeight();

            // Check if total weight exceeds 100%
            if (totalWeight > 100) {
                MessageToast.show(this.getI18nText("totalWeightExceeded"));
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
                description: trancheDescriptionValue,
                dateOfOrigin: this.formatDateWithoutTime(originDateValue),
                trancheWeight: trancheWeightValue,
                Target: oTrancheData.Target,
            };

            const oBinding = oModel.bindList("/BonusTranche") as ODataListBinding;
            const oContext = oBinding.create(newTranche);

            // Wait for the creation to complete
            await oContext.created();

            // Show success message and navigate to the overview
            MessageToast.show(this.getI18nText("trancheCreateSuccess"));
            this.getRouter().navTo("RouteMain");
            oModel.refresh();
        } catch (error) {
            MessageToast.show(error + this.getI18nText("cannotCreateTranche"));
        }
    }
    private formatDateWithoutTime(date: Date): string {
        const year = date.getFullYear(); // Full year, e.g., 2024
        const month = `0${date.getMonth() + 1}`.slice(-2); // Month is zero-indexed, so add 1 and ensure two digits
        const day = `0${date.getDate()}`.slice(-2); // Get day and ensure two digits

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
        const newTranche = {
            bonusTrancheId: oTrancheData.ID,
            name: oTrancheData.name,
            Location_ID: trancheLocationValue,
            description: oTrancheData.description,
            beginDate: this.formatDateWithoutTime(new Date(oTrancheData.beginDate)),
            endDate: this.formatDateWithoutTime(new Date(oTrancheData.endDate)),
            dateOfOrigin: this.formatDateWithoutTime(new Date(oTrancheData.dateOfOrigin)),
            trancheWeight: oTrancheData.trancheWeight,
            targets: oTrancheData.Target
        }
        const sBindingPath = '/updateBonusTranche(...)';
        // Create a context binding (without binding it to the view)
        oModel?.bindContext(sBindingPath)
            .setParameter('bonusTrancheId', newTranche.bonusTrancheId)
            .setParameter('name', newTranche.name)
            .setParameter('description', newTranche.description)
            .setParameter('Location_ID', newTranche.Location_ID)
            .setParameter('beginDate', newTranche.beginDate)
            .setParameter('endDate', newTranche.endDate)
            .setParameter('dateOfOrigin', newTranche.dateOfOrigin)
            .setParameter('trancheWeight', newTranche.trancheWeight)
            .setParameter('targets', newTranche.targets)
            .invoke()
            .then(
                // successful submit
                () => {
                    oModel.refresh();
                    MessageToast.show(this.getI18nText("TrancheEditSuccess"));
                    this.getRouter().navTo("RouteMain");
                },
                // failure in submit
                (eer) => {
                    MessageToast.show(eer + this.getI18nText("trancheEditFailed"));
                }
            );
    }



    private _duplicateTranche(trancheId: string): void {
        const oModel = this.getView()?.getModel("trancheModel") as ODataModel;
        const sBindingPath = `/BonusTranche('${trancheId}')`;

        const oContextBinding = oModel.bindContext(sBindingPath, undefined, {
            $expand: "Target",
        });

        oContextBinding
            .requestObject()
            .then((oData: Tranche) => {
                const duplicateData: Partial<Tranche> = {
                    name: oData.name || "",
                    Location_ID: oData.Location_ID,
                    beginDate: oData.beginDate || this.formatDateWithoutTime(new Date()),
                    endDate: oData.endDate || this.formatDateWithoutTime(new Date()),
                    description: oData.description || "",
                    dateOfOrigin:
                        oData.dateOfOrigin || this.formatDateWithoutTime(new Date()),
                    trancheWeight: oData.trancheWeight || "",
                    status: oData.status || "",
                    Target: oData.Target.map((target) => ({
                        name: target.name || "",
                        weight: target.weight || 0,
                        achievement: target.achievement || "",
                        description: target.description || "",
                    })),
                };

                this.updateModelData("trancheData", duplicateData, true);
                this.updateTotalWeightDisplay();
            })
            .catch(() => {
                MessageToast.show(this.getI18nText("errorDuplicatingTranche"));
            });
    }

    private _loadTrancheDetails(trancheId: string): void {
        // Get the OData V4 model
        const oModel = this.getView()?.getModel("trancheModel") as ODataModel;
        const sBindingPath = `/BonusTranche('${trancheId}')`;
        // Create a context binding (without binding it to the view)
        const oContextBinding = oModel.bindContext(sBindingPath, undefined, {
            $expand: "Target",
        });

        // Fetch the data from the bound context
        oContextBinding
            .requestObject()
            .then((oData: Tranche) => {
                const editTranche: Tranche = {
                    ID: oData.ID,
                    name: oData.name,
                    beginDate: oData.beginDate,
                    dateOfOrigin: oData.dateOfOrigin,
                    modifiedBy: oData.modifiedBy,
                    status: oData.status,
                    endDate: oData.endDate,
                    Location_ID: oData.Location_ID,
                    Target: oData.Target,
                    trancheWeight: oData.trancheWeight,
                    description: oData.description,
                };
                this.updateModelData("trancheData", editTranche, true);
                this.updateTotalWeightDisplay();
            })
            .catch(() => {
                MessageToast.show(this.getI18nText("FetchError"));
            });
    }



    public onAddTarget(): void {
        this.targetCurrentOperation = "create"
        this.checkDialog()
        this._pDialog?.then((oDialog) => {
            oDialog.open();
            (this.byId("targetNameInput") as Input)?.setValue("");
            (this.byId("targetAchievementInput") as Input)?.setValue("");
            (this.byId("targetWeightInput") as Input)?.setValue("");
            (this.byId("targetDescriptionInput") as TextArea)?.setValue("");
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
    private checkDialog(): void {
        const oView = this.getView() as View;
        if (!this.byId("createEditTargetDialog")) {
            this._pDialog = Fragment.load({
                id: oView.getId(),
                name: "amalisov.cuibono.view.fragment.createEditTarget",
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
    }

    public CreateTarget() {

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

        this.updateTotalWeightDisplay()

        // Show a success message
        MessageToast.show(this.getI18nText("targetAdded"));

        // Close the dialog
        this.onCancelTarget();
    }
    public onCancelTarget(): void {
        const oDialog = this.byId("createEditTargetDialog") as Dialog;
        if (oDialog) {
            oDialog.close();
        } else {
            //
            MessageToast.show(this.getI18nText("dialogNotFound"))

        }
    }
    public onEditTargetPress(oEvent: Event) {
        this.targetCurrentOperation = "edit"
        this.checkDialog()
        // Get the item and its binding context
        const oItem = <CustomListItem>oEvent.getSource();
        const oContext = oItem.getBindingContext("trancheData") as Context;

        // Save the binding context for later use (when saving the edits)
        this._oEditContext = oContext;

        const oData = this.getView()?.getModel("trancheData")?.getObject(oContext.getPath()) as Target;
        const targetData: Target = {
            name: oData.name,
            achievement: oData.achievement,
            weight: oData.weight,
            description: oData.description
        };
        this._pDialog?.then((oDialog) => {
            oDialog.open();
            // Get the new target details from the input fields
            (this.byId("targetNameInput") as Input)?.setValue(targetData.name);
            (this.byId("targetAchievementInput") as Input)?.setValue(targetData.achievement);
            (this.byId("targetWeightInput") as Input)?.setValue(targetData.weight.toString());
            (this.byId("targetDescriptionInput") as TextArea)?.setValue(targetData.description || "");
        }).catch(() => {

            MessageToast.show(this.getI18nText("errorDialog"))

        });
    }
    public onSaveTarget() {
        if (this.targetCurrentOperation === "create") {
            this.CreateTarget();
        } else if (this.targetCurrentOperation === "edit") {
            this.EditTarget();
        }
    }
    public EditTarget() {

        // Check if we have the context of the item being edited
        if (!this._oEditContext) {
            MessageToast.show(this.getI18nText("targetEditFailed"));
            return;
        }
        // Get the new target details from the input fields
        const sTargetName = (this.byId("targetNameInput") as Input)?.getValue();
        const iTargetWeight = parseFloat((this.byId("targetWeightInput") as Input)?.getValue());
        const sTargetAchievement = (this.byId("targetAchievementInput") as Input)?.getValue();
        const sTargetDescription = (this.byId("targetDescriptionInput") as Input)?.getValue();
        const path = this._oEditContext.getPath()
        // Retrieve the model
        const oModel = this.getView()?.getModel("trancheData") as JSONModel;

        // Get the target object using the path
        const oTarget = oModel?.getProperty(path) as Target;

        // Check if the target exists
        if (oTarget) {
            // Modify the target's fields as needed
            oTarget.name = sTargetName; // Example: updating the name
            oTarget.achievement = sTargetAchievement; // Example: updating the achievement
            oTarget.weight = iTargetWeight; // Example: updating the weight
            oTarget.description = sTargetDescription; // Example: updating the description

            // Set the updated target back to the model
            oModel.setProperty(path, oTarget);

            // Optionally, refresh the model to ensure the UI is updated
            oModel.refresh(true);
        }

        // Close the dialog
        (this.byId("createEditTargetDialog") as Dialog)?.close();
        this.updateTotalWeightDisplay()
        // Show a success message
        MessageToast.show(this.getI18nText("targetUpdated"));
    }
    public onCancelEditTarget(): void {
        const oDialog = this.byId("createEditTargetDialog") as Dialog;
        if (oDialog) {
            oDialog.close();
            oDialog.destroy();
        }
    }

    public onDeleteTargetPress(oEvent: Event) {
        // Get the row/context binding where the delete button was pressed
        const oItem = <CustomListItem>oEvent.getSource(); // ColumnListItem or CustomListItem
        const oContext = oItem.getBindingContext("trancheData");
        // Ensure that oContext exists
        if (!oContext) {
            MessageToast.show(this.getI18nText("trancheDeletionFailed"));
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
            this.messageShow("targetDeleted")

        } else {
            this.messageShow("targetDeleted")
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
    private calculateTotalTargetWeight(): number {
        const oModel = this.getView()?.getModel("trancheData") as JSONModel;

        const oTrancheData: { Target: Target[] } = oModel?.getObject("/") || { Target: [] };

        let totalWeight = 0;

        if (Array.isArray(oTrancheData.Target)) {
            totalWeight = oTrancheData.Target.reduce((acc: number, target: Target) => {
                const weight = parseFloat(target.weight?.toString() || "0");
                return acc + weight;
            }, 0);
        }

        return totalWeight;
    }


    public onNavBack() {
        this.getRouter().navTo("RouteMain")
    }

    public onLogoClick() {
        this.onNavBack()
    }



    public onReOpenTranche(): void {
        const oModel = this.getView()?.getModel("trancheData") as JSONModel;
        if (oModel) {
            oModel.setProperty("/status", "Running");
            oModel.refresh(true);

            // Display a success message
            MessageToast.show(this.getI18nText("trancheReopened"));
        }
    }

    public onCompleteTranche(): void {
        const oModel = this.getView()?.getModel("trancheData") as JSONModel;
        if (oModel) {
            const totalWeight = oModel.getProperty("/totalWeight");

            if (totalWeight === 100) {
                oModel.setProperty("/status", "Completed");
                oModel.refresh(true);

                // Display a success message
                MessageToast.show(this.getI18nText("trancheCompleted"));
            } else {
                MessageToast.show(this.getI18nText("cannotCompleteTrancheNot100"));
            }
        }
    }
    private messageShow = (error: string): void => {
        MessageToast.show(this.getI18nText(error));
    };

    public onLockTranche(): void {
        const oModel = this.getView()?.getModel("trancheData") as JSONModel;
        if (oModel) {
            oModel.setProperty("/status", "Locked");
            oModel.refresh(true);

            // Display a success message
            MessageToast.show(this.getI18nText("trancheLocked"));
        }
    }

    public onStartDateChange(oEvent: Event): void {
        // Get the DatePicker that triggered the event
        const oStartDatePicker = oEvent.getSource() as DatePicker;
        const oStartDate = oStartDatePicker.getDateValue();
        const oToday = new Date();

        // Reset the time part of today's date for comparison
        oToday.setHours(0, 0, 0, 0);

        // Set minDate to disable past dates
        oStartDatePicker.setMinDate(oToday);

        if (oStartDate && oStartDate < oToday) {

            oStartDatePicker.setValueState("Error");

            oStartDatePicker.setValueStateText(this.getI18nText("startDatePast"));

            MessageToast.show("StartDateFuture");
        } else {

            oStartDatePicker.setValueState("None");
        }
    }

    public onEndDateChange(oEvent: Event): void {
        const oEndDatePicker = oEvent.getSource() as DatePicker;
        const oEndDate = oEndDatePicker.getDateValue();

        if (oEndDate) {
            const oOriginDatePicker = this.byId("trancheOriginDate") as DatePicker;
            const oMinOriginDate = new Date(oEndDate);
            oMinOriginDate.setDate(oMinOriginDate.getDate() + 1); // At least one day after the end date
            oOriginDatePicker.setMinDate(oMinOriginDate);

            // Clear any error state for the origin date when end date is valid
            oOriginDatePicker.setValueState("None");
        }
    }

    public onOriginDateChange(oEvent: Event): void {
        const oOriginDatePicker = oEvent.getSource() as DatePicker;
        const oOriginDate = oOriginDatePicker.getDateValue();
        const oEndDatePicker = this.byId("endDate") as DatePicker;
        const oEndDate = oEndDatePicker.getDateValue();

        if (oOriginDate && oEndDate) {
            if (oOriginDate <= oEndDate) {
                // Set input to error state and display an error message
                oOriginDatePicker.setValueState("Error");

                oOriginDatePicker.setValueStateText(this.getI18nText("endDayOne"));
                //
                MessageToast.show(this.getI18nText("originDateEndDate"));
            } else {
                // Clear the error state
                oOriginDatePicker.setValueState("None");
            }
        }
    }
}
