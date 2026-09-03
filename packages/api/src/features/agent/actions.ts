import z from "zod";
import { verifiedProcedure } from "../../context";
import { mapAgentEnvironmentError } from "./routing";
import { agentService } from "./service";

export const actionsRouter = {
	revert: verifiedProcedure
		.route({
			method: "POST",
			path: "/agent/actions/{id}/revert",
			tags: ["Agent"],
			operationId: "revertAgentAction",
			summary: "Restore agent action snapshot",
		})
		.input(z.object({ id: z.string() }))
		.use(mapAgentEnvironmentError)
		.handler(async ({ context, input }) => {
			return await agentService.actions.revert({ id: input.id, userId: context.user.id });
		}),
};
