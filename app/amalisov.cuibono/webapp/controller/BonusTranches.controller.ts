import UIComponent from "sap/ui/core/UIComponent";
import { InitializationHelper, RouterArguments } from "../model/initialData";
import BaseController from "./BaseController";
import JSONModel from "sap/ui/model/json/JSONModel";
import { Route$MatchedEvent } from "sap/ui/core/routing/Route";
import ColumnListItem from "sap/m/ColumnListItem";
import MessageToast from "sap/m/MessageToast";
import Event from "sap/ui/base/Event";
import Control from "sap/ui/core/Control";


/**
 * @namespace amalisov.cuibono.controller
 */
export default class BonusTranches extends BaseController {

    private initialOdata: InitializationHelper;
    public onInit(): void {
        this.initialOdata = new InitializationHelper(this.getI18nText.bind(this));
        const oRouter = (this.getOwnerComponent() as UIComponent).getRouter();
		oRouter.getRoute("RouteMain")?.attachMatched(this.onRouteMatched, this);
        const oModel = new JSONModel(this.initialOdata.getDropdownData());
        this.getView()?.setModel(oModel, "dropdownModel");
    }


    private onRouteMatched = (oEvent: Route$MatchedEvent): void => {
		const oArgs = oEvent.getParameter("arguments") as { trancheId: string };
		const sTrancheId: string = oArgs.trancheId;

		const oView = this.getView();
		if (oView) {
			const sBindingPath = `/BonusTranches(${sTrancheId})`;
		
			oView.bindElement({
				path: sBindingPath,
				model: "trancheModel",
			});
		}
	};

    public onCreateTranche(): void {
        const oQuery: RouterArguments = {
            "?query": {
                tab: "bonusTranches",
                operation: "create"
            }
        }
        this.getRouter().navTo("RouteMain", oQuery, true /*without history*/);
    }
    public onEditPress(oEvent: Event): void {
        const oSource = oEvent.getSource() as Control; 
        const oItem = oSource.getParent() as ColumnListItem;
        const oContext = oItem.getBindingContext("trancheModel");
        console.log("model", oContext)
        const trancheId = oContext?.getProperty("ID");
        console.log("id", trancheId)

    
        if (trancheId) {
            const oQuery = {
                "?query": {
                    tab: "bonusTranches",
                    operation: "edit",
                    trancheId: trancheId
                }
            };
            this.getRouter().navTo("RouteMain", oQuery, true /*without history*/);
        } else {
            MessageToast.show(this.getI18nText("noTrancheSelected"));
        }
    }
    

    private extractID = (input: string): string | null => {
		const regex = /\([^()]*\)/; // Non-greedy match inside parentheses without nested parentheses
		const match = input.match(regex);
	
		if (match) {
			return match[0].slice(1, -1); // Remove the surrounding parentheses
		} else {
			return null;
		}
	};
}
