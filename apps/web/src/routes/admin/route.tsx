import { Trans } from "@lingui/react/macro";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { BRAND } from "@reactive-resume/brand";
import { BrandIcon } from "@reactive-resume/ui/components/brand-icon";
import { createNoindexFollowMeta } from "@/libs/seo";

export const Route = createFileRoute("/admin")({
	component: RouteComponent,
	beforeLoad: async ({ context }) => {
		if (!context.session) throw redirect({ to: "/auth/login", replace: true });
		if (context.session.user.role !== "admin") throw redirect({ to: "/dashboard", replace: true });

		return { session: context.session };
	},
	head: () => ({
		meta: [createNoindexFollowMeta()],
	}),
});

function RouteComponent() {
	return (
		<div className="min-h-screen">
			<header className="flex items-center gap-x-3 border-b px-4 py-3">
				<Link to="/" className="flex items-center gap-x-2">
					<BrandIcon variant="icon" className="size-6" />
					<span className="font-semibold">{BRAND.name}</span>
				</Link>

				<span className="text-muted-foreground text-sm">
					<Trans>Admin</Trans>
				</span>

				<Link to="/dashboard/resumes" className="ms-auto flex items-center gap-x-1.5 text-muted-foreground text-sm">
					<ArrowLeftIcon />
					<Trans>Back to dashboard</Trans>
				</Link>
			</header>

			<main className="mx-auto max-w-6xl p-4">
				<Outlet />
			</main>
		</div>
	);
}
