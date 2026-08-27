import { crudRouter } from "./crud";

export const billingRouter = {
	getMySubscription: crudRouter.getMySubscription,
	listPlans: crudRouter.listPlans,
	createCheckout: crudRouter.createCheckout,
};
