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
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
import MessageBox from "sap/m/MessageBox";
import Table from "sap/m/Table";
import ListBinding from "sap/ui/model/ListBinding";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import { SearchField$SearchEvent } from "sap/m/SearchField";


/**
 * @namespace amalisov.cuibono.controller
 */
export default class BonusTranches extends BaseController {
    public formatter = Formatter;

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
                parameters: {
                    expand: "Target"
                }
               
            });
        }
    };

    public handleSearch(event: SearchField$SearchEvent): void {
		const sValue = event.getParameter("query");

		// Create individual filters
		const nameFilter = new Filter({
			path: "status",
			operator: FilterOperator.Contains,
			value1: sValue?.toLowerCase(),
			caseSensitive: false,
		});

		const locationFilter = new Filter({
			path: "Location/name",
			operator: FilterOperator.Contains,
			value1: sValue?.toLowerCase(),
			caseSensitive: false,
		});

		const statusFilter = new Filter({
			path: "name",
			operator: FilterOperator.Contains,
			value1: sValue?.toLowerCase(),
			caseSensitive: false,
		});

		// Combine filters using AND
		const combinedFilter = new Filter({
			filters: [
				locationFilter,
				nameFilter,
				statusFilter,
			],
			and: false,
		});

		const oTable = this.byId("idTranchesTable") as Table;
		const oBinding = oTable.getBinding("items") as ListBinding;
		oBinding.filter([combinedFilter]);
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
    
}

