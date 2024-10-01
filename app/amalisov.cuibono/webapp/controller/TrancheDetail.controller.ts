import BaseController from "./BaseController";
import UIComponent from "sap/ui/core/UIComponent";
import JSONModel from "sap/ui/model/json/JSONModel";
import Event from "sap/ui/base/Event";
import Router from "sap/ui/core/routing/Router";

export default class TrancheDetail extends BaseController {
    private oRouter: Router;

    private isEditMode: boolean = false;

    public onInit(): void {
        this.oRouter = this.getOwnerComponent().getRouter();
        // Attach route pattern matchers
        this.oRouter.getRoute("editTranche")?.attachPatternMatched(this._onObjectMatchedEdit, this);
        this.oRouter.getRoute("createTranche")?.attachPatternMatched(this._onObjectMatchedCreate, this);
    }

    private _onObjectMatchedEdit(oEvent: Event): void {
        this.isEditMode = true;

        const sTrancheId = oEvent.getParameter("arguments").trancheId;

        // Bind the existing tranche data for editing
        this.getView().bindElement({
            path: `/TrancheCollection/${sTrancheId}`,
            model: "tranche"
        });

    }

    private _onObjectMatchedCreate(): void {
        this.isEditMode = false;
       
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
