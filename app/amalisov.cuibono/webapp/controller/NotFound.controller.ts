import BaseController from "./BaseController";

export default class NotFound extends BaseController {

    /**
     * Navigates back to the previous page in history if available,
     * otherwise navigates to the home route.
     */
    public onLogoClick() {
        this.getRouter().navTo("RouteMain")
    }
}
