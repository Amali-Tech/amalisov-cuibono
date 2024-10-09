
import BaseController from "./BaseController";
import Fragment from "sap/ui/core/Fragment";
import View from "sap/ui/core/mvc/View";
import Dialog from "sap/m/Dialog";
import MessageToast from "sap/m/MessageToast";

import ComboBox from "sap/m/ComboBox";
import DatePicker from "sap/m/DatePicker";
import { CurrentView, InitializationHelper, Tranche } from "../model/initialData";
import JSONModel from "sap/ui/model/json/JSONModel";
import UIComponent from "sap/ui/core/UIComponent";
import { Route$MatchedEvent } from "sap/ui/core/routing/Route";
import Events from "sap/ui/base/Event";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
import Input from "sap/m/Input";
import ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";
import Context from "sap/ui/model/odata/v4/Context";

import Button from "sap/m/Button";


/**
 * @namespace amalisov.cuibono.controller
 */
export default class AddEditTranche extends BaseController {

    private _pDialog: Promise<Dialog> | undefined;
    private initialOdata: InitializationHelper;
    private _pEditDialog: Promise<Dialog> | undefined;
    private _oSelectedTargetContext: Context | undefined;
    public onInit(): void {
        const oRouter = (this.getOwnerComponent() as UIComponent).getRouter();
        oRouter.getRoute("RouteMain")?.attachMatched(this.onRouteMatched, this);
        this.initialOdata = new InitializationHelper(this.getI18nText.bind(this));
        const oModel = new JSONModel(this.initialOdata.getDropdownData());
        this.getView()?.setModel(oModel, "dropdownModel");
    }
    public onSavePress() {
        const viewData: CurrentView = (this.getView()?.getModel("currentView") as JSONModel).getData()
        console.log((this.getView()?.getModel("currentView") as JSONModel).getData())
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
            const trancheWeight = this.byId("trancheWeight") as Input

            const trancheNameValue = trancheName.getValue();
            const trancheLocationValue = trancheLocation.getSelectedKey();
            //const trancheDescriptionValue = trancheDescription.getValue();
            const beginDateValue = beginDate.getDateValue();
            const endDateValue = endDate.getDateValue();
            const trancheWeightValue = trancheWeight.getValue();

            // Validate inputs
            // if (!trancheNameValue || !trancheLocationValue || !beginDateValue || !endDateValue || !trancheWeightValue) {
            //     MessageToast.show(this.getI18nText("fillInAllFields"));
            //     return;
            // }

            const oModel = this.getView()?.getModel("trancheModel") as ODataModel;

            const newTranche: Tranche = {
                name: trancheNameValue,
                Location_ID: trancheLocationValue,
                beginDate: this.formatDateWithoutTime(beginDateValue),
                endDate: this.formatDateWithoutTime(endDateValue),
                trancheWeight: trancheWeightValue,
                Target: []
            }

            const oBinding = oModel.bindList("/BonusTranche") as ODataListBinding;
            const oContext = oBinding.create(newTranche);

            // Wait for the creation to complete
            await oContext.created();

            // Show success message and navigate to the overview
            MessageToast.show(this.getI18nText("trancheCreateSuccess"));
            this.getRouter().navTo("Main");
            oModel.refresh();
        }
        catch (error) {
            console.error(error)

            MessageToast.show(error + this.getI18nText("cannotCreateTranche"));
        }

    }

    private formatDateWithoutTime(date: Date): string {
        const year = date.getFullYear();  // Full year, e.g., 2024
        const month = (`0${date.getMonth() + 1}`).slice(-2);  // Month is zero-indexed, so add 1 and ensure two digits
        const day = (`0${date.getDate()}`).slice(-2);  // Get day and ensure two digits

        return `${year}-${month}-${day}`;
    }
    private trancheId = ""
    public async onEditTranche(): Promise<void> {
        const oModel = this.getView()?.getModel("trancheModel") as ODataModel;
        const contentInput = this.byId("") as Input;
        const newContent = contentInput.getValue();

        // Validate the content field
        if (!newContent.trim()) {
            MessageToast.show(this.getI18nText("contentValidationError"));
            return;
        }

        oModel
            .bindContext("/BonusTranche(...)")
            .setParameter("ID", this.trancheId)
            .setParameter("content", newContent)
            .invoke()
            .then(
                // successful submit
                () => {
                    oModel.refresh();

                    MessageToast.show(this.getI18nText("answerEditSuccess"));
                },
                // failure in submit
                (eer) => {
                    MessageToast.show(eer + this.getI18nText("answerEditFailed"));
                }
            );
    }

    private onRouteMatched = (oEvent: Route$MatchedEvent): void => {
        const oArgs = oEvent.getParameter("arguments") as { "?query"?: { operation?: string; trancheId?: string } };


        const oQuery = oArgs["?query"];

        if (oQuery && oQuery.operation === "edit" && oQuery.trancheId) {
            this._loadTrancheDetails(oQuery.trancheId);
        }
    };

    private _loadTrancheDetails(trancheId: string): void {

        const oView = this.getView()

        if (oView) {
            const sBindingPath = `/BonusTranche('${trancheId}')`
            oView.bindElement({
                path: sBindingPath,
                model: "trancheModel",
                parameters: {
                    expand: "Target",

                },
            });
        }
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

    public onCancelCreateTarget(): void {
        const oDialog = this.byId("createTargetDialog") as Dialog;
        if (oDialog) {
            oDialog.close();
        } else {
            //
            MessageToast.show(this.getI18nText("dialogNotFound"))

        }
    }

    public async onCreateTarget(): Promise<void> {

        const oDialog = this.byId("createTargetDialog") as Dialog;
        if (oDialog) {
            const oView = this.getView() as View;
            const oModel = oView.getModel("trancheModel") as ODataModel;

            // Retrieve input values
            const sName = (this.byId("targetNameInput") as Input).getValue();
            const sWeight = parseFloat((this.byId("targetWeightInput") as Input).getValue());
            const sAchievement = (this.byId("targetAchievementInput") as Input).getValue();

            // Validate inputs
            if (!sName.trim() || isNaN(sWeight) || !sAchievement.trim()) {
                MessageToast.show(this.getI18nText("inputValidationError"));
                return;
            }

            // Create a new target object
            const oNewTarget = {
                ID: this._generateUUID(),
                name: sName,
                weight: sWeight,
                achievement: sAchievement
            };

            try {
                // Get the binding context and path
                const oContext = oView.getBindingContext("trancheModel");
                if (oContext) {
                    const sPath = `${oContext.getPath()}/Target`;

                    const oBinding = oModel.bindList(sPath) as ODataListBinding;
                    const oNewContext = oBinding.create(oNewTarget);

                    await oNewContext.created();

                    MessageToast.show(this.getI18nText("targetCreated"));
                    oDialog.close();
                    oModel.refresh(); // Refresh model to show the new target
                }
            } catch (error) {
                MessageToast.show(error + this.getI18nText("targetCreationFailed"));
            }
        } else {
            MessageToast.show(this.getI18nText("dialogNotFound"));
        }
    }

    private _generateUUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    public onEditTargetPress(oEvent: Events): void {
        const oView = this.getView() as View;
        const oButton = oEvent.getSource() as Button;
        this._oSelectedTargetContext = oButton.getBindingContext("trancheModel") as Context;

        if (!this._pEditDialog) {
            this._pEditDialog = Fragment.load({
                id: oView.getId(),
                name: "amalisov.cuibono.view.fragment.editTarget",
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

        this._pEditDialog.then((oDialog) => {
            // Pre-fill the dialog with the selected target's data
            if (this._oSelectedTargetContext) {
                const oTargetData = this._oSelectedTargetContext.getObject();
                (this.byId("editTargetNameInput") as Input).setValue(oTargetData.name);
                (this.byId("editTargetWeightInput") as Input).setValue(oTargetData.weight);
                (this.byId("editTargetAchievementInput") as Input).setValue(oTargetData.achievement);
            }
            oDialog.open();
        }).catch(() => {
            MessageToast.show(this.getI18nText("errorDialog"));
        });
    }



    public async onSaveEditTarget(): Promise<void> {
        if (this._oSelectedTargetContext) {
            const sName = (this.byId("editTargetNameInput") as Input).getValue();
            const sWeight = parseFloat((this.byId("editTargetWeightInput") as Input).getValue());
            const sAchievement = (this.byId("editTargetAchievementInput") as Input).getValue();

            // Update model with new data

            this._oSelectedTargetContext.setProperty("name", sName);
            this._oSelectedTargetContext.setProperty("weight", sWeight);
            this._oSelectedTargetContext.setProperty("achievement", sAchievement);

            // Show success message
            MessageToast.show(this.getI18nText("editSuccess"));
            const oDialog = this.byId("editTargetDialog") as Dialog;
            if (oDialog) {
                oDialog.close();
            }
        }
    }

    public onCancelEditTarget(): void {
        const oDialog = this.byId("editTargetDialog") as Dialog;
        if (oDialog) {
            oDialog.close();
        }
    }



    public async onDeleteTargetPress(): Promise<void> {

    }
}