import UIComponent from "sap/ui/core/UIComponent";
import { CurrentEditID, FilterItemName, InitializationHelper, RouterArguments } from "../model/initialData";
import BaseController from "./BaseController";
import JSONModel from "sap/ui/model/json/JSONModel";
import { Route$MatchedEvent } from "sap/ui/core/routing/Route";
import ColumnListItem from "sap/m/ColumnListItem";
import MessageToast from "sap/m/MessageToast";
import Event from "sap/ui/base/Event";
import Control from "sap/ui/core/Control";
import Formatter from "../model/formatter";
import Table from "sap/m/Table";
import Filter from "sap/ui/model/Filter";
import FilterItem from "sap/ui/comp/filterbar/FilterItem";
import FilterBar from "sap/ui/comp/filterbar/FilterBar";
import SearchField from "sap/m/SearchField";
import MultiComboBox from "sap/m/MultiComboBox";
import FilterOperator from "sap/ui/model/FilterOperator";
import ListBinding from "sap/ui/model/ListBinding";
import ComboBox from "sap/m/ComboBox";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
import MessageBox from "sap/m/MessageBox";

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
        const oIdModel = new JSONModel({ currentEditId: "" });
        this.getView()?.setModel(oIdModel, "currentID");
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
                parameters: {
                    expand: "Target"
                }

            });
        }
    };
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
    public onCreateTranche(): void {

        const oQuery: RouterArguments = {
            "?query": {
                tab: "bonusTranches",
                operation: "create"
            }
        }

        this.getRouter().navTo("AddEditTranche", oQuery, true /*without history*/);
    }
    public onEditPress(oEvent: Event): void {
        const oSource = oEvent.getSource() as Control;
        const oItem = oSource.getParent() as ColumnListItem;
        const oContext = oItem.getBindingContext("trancheModel");

        const trancheId = oContext?.getProperty("ID");

        if (trancheId) {
            const currentIdOBJ: CurrentEditID = { currentEditId: trancheId }
            this.updateModelData("currentID", currentIdOBJ)
            const oQuery = {
                "?query": {
                    tab: "bonusTranches",
                    operation: "edit",
                    trancheId: trancheId
                }
            };
            this.getRouter().navTo("AddEditTranche", oQuery, true);
        } else {
            MessageToast.show(this.getI18nText("noTrancheSelected"));
        }
    }

    public onCopyPress(oEvent: Event): void {
        const oSource = oEvent.getSource() as Control;
        const oItem = oSource.getParent() as ColumnListItem;
        const oContext = oItem.getBindingContext("trancheModel");

        const trancheId = oContext?.getProperty("ID");

        if (trancheId) {
            const oQuery = {
                "?query": {
                    tab: "bonusTranches",
                    operation: "create",
                    trancheId: trancheId
                }
            };
            this.getRouter().navTo("RouteMain", oQuery, true /*without history*/);
        } else {
            MessageToast.show(this.getI18nText("noTrancheSelected"));
        }
    }

    private messageShow = (error: string): void => {
        MessageToast.show(this.getI18nText(error));
    };

    public onDeletePress(oEvent: Event): void {
        const oSource = oEvent.getSource() as Control;
        const oItem = oSource.getParent() as ColumnListItem;
        const oContext = oItem.getBindingContext("trancheModel");

        if (!oContext) {
            MessageToast.show(this.getI18nText("noTrancheSelected"));
            return;
        }

        const trancheId = oContext.getProperty("ID");
        const trancheName = oContext.getProperty("name");

        // Show a confirmation dialog
        MessageBox.confirm(
            this.getI18nText("deleteConfirmation", [trancheName]),
            {

                title: this.getI18nText("deleteTitle"),
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.OK,
                // Correctly specify the parameter type as string
                onClose: (sAction: string) => {
                    if (sAction === MessageBox.Action.OK) {
                        this._deleteTranche(trancheId);
                    }
                }
            }
        );
    }

    private _deleteTranche(trancheId: string): void {
        const oModel = this.getView()?.getModel("trancheModel") as ODataModel;
        const sPath = `/BonusTranche('${trancheId}')`;

        oModel.delete(sPath)
            .then(() => {
                MessageToast.show(this.getI18nText("deleteSuccess"));
                oModel.refresh();
            })
            .catch(() => {

                MessageBox.error(this.getI18nText("deleteError"));
            });
    }

    public onSearch(): void {
        // Initialize an array to hold the filters
        const aFilters: Filter[] = [];
        // Get all filter items, including hidden ones
        const aFilterItems: FilterItem[] = this._oFilterBar.getAllFilterItems(true);
        aFilterItems.forEach((oItem) => {
            const oControl = oItem.getControl();
            if (oControl) {
                let sValue: string | string[] | Date[] | null = "";
                let sPath: string = "";
                const sOperator: FilterOperator = FilterOperator.Contains;
                // Check if the control is a MultiComboBox and get selected keys
                if ((oControl as ComboBox).getSelectedKey && oItem.getName() === "fiscalYear") {
                    const fiscalYear = (oControl as ComboBox).getSelectedKey();
                    const [startYear, endYear] = fiscalYear.trim().split('-').map(year => parseInt(year, 10));
                    // Generate the start and end dates dynamically (e.g., 22 October for both years)
                    const startDate = new Date(startYear, 9, 22);  // October is month 9 (0-based index)
                    const endDate = new Date(endYear, 9, 22);      // October for the end year
                    // Use the dynamically generated dates (formatted as "YYYY-MM-DD")
                    sValue = [startDate.toISOString().split("T")[0], endDate.toISOString().split("T")[0]];
                }
                else if (
                    (oControl as MultiComboBox).getSelectedKeys
                ) {
                    sValue = (oControl as MultiComboBox).getSelectedKeys();
                } else if ((oControl as SearchField).getValue) {
                    sValue = (oControl as SearchField).getValue();
                }
                else {
                    sValue = null
                }
                if (
                    sValue &&
                    ((Array.isArray(sValue) && sValue.length > 0) ||
                        (!Array.isArray(sValue) && sValue !== null))
                ) {
                    sPath = this.getPathName(oItem);
                    if (sPath) {
                        if (Array.isArray(sValue) && oItem.getName() === "fiscalYear") {
                            aFilters.push(new Filter("beginDate", FilterOperator.GE, sValue[0]))
                            aFilters.push(new Filter("endDate", FilterOperator.LE, sValue[1]))
                        }
                        else if (Array.isArray(sValue)) {
                            // Create filters for other array values
                            sValue.forEach((val) => {
                                aFilters.push(new Filter(sPath, sOperator, val));
                            });
                        } else {
                            // Create filters for other single values
                            aFilters.push(new Filter({ path: sPath, operator: sOperator, value1: sValue, caseSensitive: false }));
                        }
                    }
                }
            }
            // Apply filters to the table binding
            if (this._oTable1 && this._oTable1.getBinding) {
                const oBinding = this._oTable1.getBinding("items") as ListBinding;
                if (oBinding) {
                    oBinding.filter(aFilters);
                }
            } else {
                this.messageShow("tableBinding"); // Show error if table binding fails
            }
        })
    }

    private getPathName(oItem: FilterItem): string {
        switch (oItem.getName()) {
            case FilterItemName.STATUS:
                return "status";
            case FilterItemName.SEARCH:
                return "name";
            case FilterItemName.FISCAL:
                return "fiscal";
            case FilterItemName.LOCATION:
                return "Location_ID";
            default:
                return "";
        }
    }





}

