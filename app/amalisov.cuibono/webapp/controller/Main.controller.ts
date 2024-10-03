import Event from "sap/ui/base/Event";
import BaseController from "./BaseController";
import { CurrentView, RouterArguments } from "../model/initialData";
import JSONModel from "sap/ui/model/json/JSONModel";

/**
 * @namespace amalisov.cuibono.controller
 */
export default class Main extends BaseController {
    private _oRouterArgs: RouterArguments = {
        "?query": { tab: "bonusTranche" },
    };
    private _validTabKeys = ["bonusTranches", "participants"]
    private currentView: CurrentView = { currentView: "default" }

    public onInit(): void {
        this.getRouter()?.getRoute("RouteMain")?.attachPatternMatched(this.onObjectMatched, this);
        this.getView()?.setModel(new JSONModel(), "view");
        this.getView()?.setModel(
            new JSONModel(this.currentView),
            "currentView"
        );
    }

    onObjectMatched(event: Event) {
        // save the current query state
        this._oRouterArgs = event.getParameter("arguments" as never);
        this._oRouterArgs["?query"] = this._oRouterArgs["?query"] ?? {};
        const oQuery: RouterArguments["?query"] = this._oRouterArgs["?query"];

        if (oQuery && this._validTabKeys.indexOf(oQuery.tab ?? "") > -1) {
            this.updateModelData("view", { tab: oQuery.tab })
            // support lazy loading for the participants and tranche
            if (oQuery.tab === "participants") {
                this.getRouter()?.getTargets()?.display("Participants");
            } else {
                this.getRouter()?.getTargets()?.display("BonusTranches");
                this.setCurrentPage(oQuery)
            }
        } else {

            // the default query param should be visible at all time
            this.getRouter().navTo("RouteMain", {
                "?query": {
                    tab: this._validTabKeys[0]
                }
            }, true /*no history*/);
        }
    }
    private setCurrentPage = (oQuery: RouterArguments["?query"]) => {
        if (oQuery?.operation) {
            this.currentView.currentView = oQuery.operation
            this.updateModelData("currentView", this.currentView)

        }
        else {
            this.currentView.currentView = "default"
            this.updateModelData("currentView", this.currentView)
        }
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

    public onTabSelect(oEvent: Event): void {
        const selectedKey = oEvent.getParameter("selectedKey" as never);
        const oQuery: RouterArguments = {
            "?query": {
                tab: selectedKey,
            }
        }
        this.getRouter().navTo("RouteMain", oQuery, true /*without history*/);
    }
}

