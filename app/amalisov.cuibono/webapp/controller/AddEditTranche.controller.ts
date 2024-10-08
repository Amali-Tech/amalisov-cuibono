
import BaseController from "./BaseController";
import Fragment from "sap/ui/core/Fragment";
import View from "sap/ui/core/mvc/View";
import Dialog from "sap/m/Dialog";
import MessageToast from "sap/m/MessageToast";
import UIComponent from "sap/ui/core/UIComponent";
import { Route$MatchedEvent } from "sap/ui/core/routing/Route";

/**
 * @namespace amalisov.cuibono.controller
 */
export default class AddEditTranche extends BaseController {

    private _pDialog: Promise<Dialog> | undefined;

    public onInit(): void {
        const oRouter = (this.getOwnerComponent() as UIComponent).getRouter();
		oRouter.getRoute("RouteMain")?.attachMatched(this.onRouteMatched, this);

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

        if(oView) {
            const sBindingPath = `/BonusTranche('${trancheId}')`
            oView.bindElement({
				path: sBindingPath,
				model: "trancheModel",
                parameters: {
                    expand: "Target" 
                }
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