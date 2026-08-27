import type { Icon as IconType } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { cn } from "@reactive-resume/utils/style";

type Props = {
	title: string;
	icon: IconType;
	className?: string;
	badge?: ReactNode;
	actions?: ReactNode;
};

// Mirrors `dashboard/-components/header.tsx`, minus the sidebar trigger: the admin section has
// no `SidebarProvider` (it doesn't use the dashboard's collapsible sidebar), so reusing the
// dashboard header directly crashes with "useSidebarState must be used within a SidebarProvider".
export function AdminHeader({ title, icon: IconComponent, className, badge, actions }: Props) {
	return (
		<div className={cn("flex items-center gap-x-2.5", className)}>
			<div className="flex flex-1 items-center gap-x-2.5">
				<IconComponent weight="light" className="size-5" />
				<h1 className="font-medium text-xl tracking-tight">{title}</h1>
				{badge}
			</div>
			{actions ? <div className="flex items-center gap-x-2">{actions}</div> : null}
		</div>
	);
}
