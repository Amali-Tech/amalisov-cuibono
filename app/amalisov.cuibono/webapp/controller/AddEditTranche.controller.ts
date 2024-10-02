
import BaseController from "./BaseController";
import Fragment from "sap/ui/core/Fragment";
import View from "sap/ui/core/mvc/View";
import Dialog from "sap/m/Dialog";
import MessageToast from "sap/m/MessageToast";

/**
 * @namespace amalisov.cuibono.controller
 */
export default class AddEditTranche extends BaseController {

    private _pDialog: Promise<Dialog> | undefined;

    public onInit(): void {

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
                    throw new Error("Dialog fragment is not loaded correctly");
                }
            });
        }

        this._pDialog.then((oDialog) => {
            oDialog.open();
        }).catch(() => {
            MessageToast.show("Error opening the dialog")

        });
    }

    public onCancelCreateTarget(): void {
        const oDialog = this.byId("createTargetDialog") as Dialog;
        if (oDialog) {
            oDialog.close();
        } else {
            MessageToast.show("Dialog not found")

        }
    }

    public onCreateTarget(): void {
        // Add your logic to handle creating the target here
        const oDialog = this.byId("createTargetDialog") as Dialog;
        if (oDialog) {
            oDialog.close();
        } else {
            MessageToast.show("Dialog not found")

        }
    }

    public onEditTargetPress(): void {
        // Logic for editing a target

    }

    public onDeleteTargetPress(): void {
        // Logic for deleting a target

    }
}