import { crudRouter } from "./crud";

export const billingRouter = {
	getMySubscription: crudRouter.getMySubscription,
	listPlans: crudRouter.listPlans,
	updatePlan: crudRouter.updatePlan,
	createCheckout: crudRouter.createCheckout,
};
