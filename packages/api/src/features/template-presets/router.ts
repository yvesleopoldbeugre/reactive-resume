import { crudRouter } from "./crud";

export const templatePresetsRouter = {
	list: crudRouter.list,
	getById: crudRouter.getById,
	create: crudRouter.create,
	update: crudRouter.update,
	setPublished: crudRouter.setPublished,
	delete: crudRouter.delete,
	listPublished: crudRouter.listPublished,
};
