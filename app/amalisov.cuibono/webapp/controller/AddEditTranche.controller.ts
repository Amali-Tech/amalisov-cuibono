
import BaseController from "./BaseController";
import Fragment from "sap/ui/core/Fragment";
import View from "sap/ui/core/mvc/View";
import Dialog from "sap/m/Dialog";
import MessageToast from "sap/m/MessageToast";
import Input from "sap/m/Input";
import ComboBox from "sap/m/ComboBox";
import DatePicker from "sap/m/DatePicker";
import { CurrentView, InitializationHelper, Tranche } from "../model/initialData";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
import ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";
import JSONModel from "sap/ui/model/json/JSONModel";

/**
 * @namespace amalisov.cuibono.controller
 */
export default class AddEditTranche extends BaseController {

    private _pDialog: Promise<Dialog> | undefined;
    private initialOdata: InitializationHelper;
    public onInit(): void {
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

    public onCreateTarget(): void {

        const oDialog = this.byId("createTargetDialog") as Dialog;
        if (oDialog) {
            oDialog.close();
        } else {
            MessageToast.show(this.getI18nText("dialogNotFound"))


        }
    }

    public onEditTargetPress(): void {
        // Logic for editing a target

    }

    public onDeleteTargetPress(): void {
        // Logic for deleting a target

    }
}