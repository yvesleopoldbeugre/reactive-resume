import { Trans } from "@lingui/react/macro";
import { BRAND, UPSTREAM } from "@reactive-resume/brand";
import { cn } from "@reactive-resume/utils/style";

type Props = React.ComponentProps<"div">;

export function Copyright({ className, ...props }: Props) {
	return (
		<div className={cn("text-muted-foreground/80 text-xs leading-relaxed", className)} {...props}>
			<p>
				<Trans>
					Built on open-source software licensed under{" "}
					<a
						href={UPSTREAM.licenseUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="font-medium underline underline-offset-2"
					>
						MIT
					</a>
					.
				</Trans>
			</p>

			<p className="mt-4">
				<Trans comment="App version label in footer; includes semantic version variable">
					{BRAND.name} v<bdi>{__APP_VERSION__}</bdi>
				</Trans>
			</p>
		</div>
	);
}
