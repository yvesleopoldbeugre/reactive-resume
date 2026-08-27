// @vitest-environment happy-dom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";

vi.stubGlobal("__APP_VERSION__", "9.9.9");

// The footer module evaluates `getContactLinks = () => [{ label: t`...`, ... }]` at module
// scope. That `t` call needs an activated locale BEFORE the import, so do that
// here instead of in beforeAll.
i18n.loadAndActivate({ locale: "en", messages: {} });

const { Footer } = await import("./footer");

const renderFooter = () =>
	render(
		<I18nProvider i18n={i18n}>
			<Footer />
		</I18nProvider>,
	);

describe("Footer", () => {
	it("renders the brand name and tagline", () => {
		renderFooter();
		expect(screen.getByText("Essor")).toBeInTheDocument();
		expect(screen.getByText("Un CV qui prend son envol")).toBeInTheDocument();
	});

	it("renders a Contact group with a mailto link", () => {
		const { container } = renderFooter();
		expect(screen.getByText("Contact")).toBeInTheDocument();
		const hrefs = Array.from(container.querySelectorAll<HTMLAnchorElement>("a")).map((a) => a.href);
		expect(hrefs.some((h) => h.startsWith("mailto:"))).toBe(true);
	});

	it("includes the app version copy via Copyright", () => {
		renderFooter();
		// The version is wrapped in <bdi> for RTL isolation, so it is its own text node.
		expect(screen.getByText("9.9.9")).toBeInTheDocument();
	});
});
