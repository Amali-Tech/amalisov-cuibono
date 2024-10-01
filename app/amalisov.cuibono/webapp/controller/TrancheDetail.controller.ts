import BaseController from "./BaseController";
import UIComponent from "sap/ui/core/UIComponent";
import JSONModel from "sap/ui/model/json/JSONModel";
import Event from "sap/ui/base/Event";

export default class TrancheDetail extends BaseController {

    private isEditMode: boolean = false;

    public onInit(): void {
        const oRouter = UIComponent.getRouterFor(this);
        // Attach route pattern matchers
        oRouter.getRoute("editTranche")?.attachPatternMatched(this._onObjectMatchedEdit, this);
        oRouter.getRoute("createTranche")?.attachPatternMatched(this._onObjectMatchedCreate, this);
    }

    private _onObjectMatchedEdit(oEvent: Event): void {
        this.isEditMode = true;

        const sTrancheId = oEvent.getParameter("arguments").trancheId;

        // Bind the existing tranche data for editing
        this.getView().bindElement({
            path: `/TrancheCollection/${sTrancheId}`,
            model: "tranche"
        });

        // Set the model flag for editing
        const oViewModel = this.getView().getModel("view") as JSONModel;
        oViewModel.setProperty("/isEditMode", true);
    }

    private _onObjectMatchedCreate(): void {
        this.isEditMode = false;

        // Set up a new empty tranche for creation
        const oNewTranche = {
            Status: "",
            Name: "",
            Location: "",
            Description: "",
            StartDate: "",
            EndDate: "",
            Weight: ""
        };

        // Set the new tranche data to the model (create mode)
        const oTrancheModel = this.getView().getModel("tranche") as JSONModel;
        oTrancheModel.setData(oNewTranche);

        // Set the model flag for creation
        const oViewModel = this.getView().getModel("view") as JSONModel;
        oViewModel.setProperty("/isEditMode", false);
    }

    public onSaveTranche(): void {
        const oTrancheModel = this.getView().getModel("tranche") as JSONModel;
        const oTrancheData = oTrancheModel.getData();

        if (this.isEditMode) {
            // Logic to update existing tranche
            console.log("Saving changes to tranche:", oTrancheData);
            // Implement the update request to backend here
        } else {
            // Logic to create new tranche
            console.log("Creating new tranche:", oTrancheData);
            // Implement the create request to backend here
        }
    }

    public onAddTarget(): void {
        // Logic for adding a target to the tranche
        console.log("Add target pressed");
    }

    public onEditTargetPress(): void {
        // Logic for editing a target
        console.log("Edit target pressed");
    }

    public onDeleteTargetPress(): void {
        // Logic for deleting a target
        console.log("Delete target pressed");
    }
}
