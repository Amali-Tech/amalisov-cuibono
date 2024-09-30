import { InitializationHelper } from "../model/initialData";
import BaseController from "./BaseController";
import JSONModel from "sap/ui/model/json/JSONModel";

/**
 * @namespace amalisov.cuibono.controller
 */
export default class BonusTranches extends BaseController {
    private initialOdata: InitializationHelper;
    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {
        this.initialOdata = new InitializationHelper(this.getI18nText.bind(this));
        const oModel = new JSONModel(this.initialOdata.getDropdownData());
        this.getView()?.setModel(oModel, "dropdownModel");
    }
}