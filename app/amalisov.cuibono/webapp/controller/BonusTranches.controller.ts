import UIComponent from "sap/ui/core/UIComponent";
import { InitializationHelper, RouterArguments } from "../model/initialData";
import BaseController from "./BaseController";
import JSONModel from "sap/ui/model/json/JSONModel";
import { Route$MatchedEvent } from "sap/ui/core/routing/Route";
import ColumnListItem from "sap/m/ColumnListItem";
import MessageToast from "sap/m/MessageToast";
import Event from "sap/ui/base/Event";
import Control from "sap/ui/core/Control";
import Formatter from "../model/formatter";
import FilterBar from "sap/sac/df/FilterBar";
import Table from "sap/m/Table";
import FilterGroupItem from "sap/ui/comp/filterbar/FilterGroupItem";

/**
 * @namespace amalisov.cuibono.controller
 */
export default class BonusTranches extends BaseController {
    public formatter = Formatter;
    private _oFilterBar: FilterBar;
    private _oTable1: Table;

    private initialOdata: InitializationHelper;
    public onInit(): void {
        this.initialOdata = new InitializationHelper(this.getI18nText.bind(this));
        const oRouter = (this.getOwnerComponent() as UIComponent).getRouter();
        oRouter.getRoute("RouteMain")?.attachMatched(this.onRouteMatched, this);
        const oModel = new JSONModel(this.initialOdata.getDropdownData());
        this.getView()?.setModel(oModel, "dropdownModel");
        this._oFilterBar = this.byId("filterbar2") as FilterBar;
        this._oTable1 = this.byId("idTranchesTable") as Table;
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

        const trancheId = oContext?.getProperty("ID");

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
    public onSearch(): void {

    }

    private getPathName(oItem: FilterGroupItem): string {
        switch (oItem.getName()) {
            case "status":
                return "status";
            case "Search":
                return "search";
            case "fiscalYear":
                return "fiscal";
            case "locationID":
                return "location";
            default:
                return "";
        }
    }



    private errorShow = (error: string): void => {
        MessageToast.show(this.getI18nText(error));
    };
}

