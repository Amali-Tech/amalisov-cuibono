import { InitializationHelper, RouterArguments } from "../model/initialData";
import BaseController from "./BaseController";
import JSONModel from "sap/ui/model/json/JSONModel";



/**
 * @namespace amalisov.cuibono.controller
 */
export default class BonusTranches extends BaseController {

    private initialOdata: InitializationHelper;
    public onInit(): void {
        this.initialOdata = new InitializationHelper(this.getI18nText.bind(this));
        const oModel = new JSONModel(this.initialOdata.getDropdownData());
        this.getView()?.setModel(oModel, "dropdownModel");
    }


    public onCreateTranche(): void {
        const oQuery: RouterArguments = {
            "?query": {
                tab: "bonusTranches",
                operation: "create"
            }
        }
        this.getRouter().navTo("RouteMain", oQuery, true /*without history*/);
    }
    public onEditPress(): void {
        const oQuery: RouterArguments = {
            "?query": {
                tab: "bonusTranches",
                operation: "edit"
            }
        }
        this.getRouter().navTo("RouteMain", oQuery, true /*without history*/);
    }
}