import { InitializationHelper } from "../model/initialData";
import BaseController from "./BaseController";
import JSONModel from "sap/ui/model/json/JSONModel";
import Router from "sap/ui/core/routing/Router";


/**
 * @namespace amalisov.cuibono.controller
 */
export default class BonusTranches extends BaseController {
    private oRouter: Router;
    private initialOdata: InitializationHelper;
    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {
        this.oRouter = this.getOwnerComponent().getRouter();
        this.initialOdata = new InitializationHelper(this.getI18nText.bind(this));
        const oModel = new JSONModel(this.initialOdata.getDropdownData());
        this.getView()?.setModel(oModel, "dropdownModel");
    }

    public onCreateTranche(): void {
       
        this.oRouter.navTo("createTranche"); 
    }

    

   
    
}