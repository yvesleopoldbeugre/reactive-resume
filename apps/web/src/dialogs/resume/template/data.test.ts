import { describe, expect, it } from "vitest";
import { getTemplatesForKind, templates } from "./data";

describe("templates metadata", () => {
	const entries = Object.entries(templates);

	it("declares the expected template ids", () => {
		const ids = Object.keys(templates).sort();
		expect(ids).toEqual(
			[
				"azurill",
				"bronzor",
				"chikorita",
				"custom",
				"ditgar",
				"ditto",
				"eevee",
				"espeon",
				"gengar",
				"glalie",
				"kakuna",
				"lapras",
				"leafish",
				"meowth",
				"onyx",
				"pikachu",
				"rhyhorn",
				"scizor",
				"snorlax",
				"togepi",
				"vulpix",
			].sort(),
		);
	});

	it("provides a name, description, image, and tags for every template", () => {
		for (const [id, meta] of entries) {
			expect(meta.name, id).toBeTruthy();
			expect(meta.description, id).toBeDefined();
			expect(meta.imageUrl, id).toMatch(/^\/templates\//);
			expect(Array.isArray(meta.tags), id).toBe(true);
			expect(meta.tags.length, id).toBeGreaterThan(0);
		}
	});

	it("uses a recognized sidebar position for every template", () => {
		const validPositions = new Set(["left", "right", "none"]);
		for (const [id, meta] of entries) {
			expect(validPositions.has(meta.sidebarPosition), `${id}: ${meta.sidebarPosition}`).toBe(true);
		}
	});

	it("uses unique image URLs per template", () => {
		const urls = entries.map(([, m]) => m.imageUrl);
		expect(new Set(urls).size).toBe(urls.length);
	});

	it("uses lowercase ids", () => {
		for (const [id] of entries) {
			expect(id).toBe(id.toLowerCase());
		}
	});

	// The 15 built-in templates use their codename as the display name; "custom" is a functional
	// entry (the from-scratch starting point) and gets a descriptive display name instead.
	it("uses a lowercase display name matching the id for every built-in template", () => {
		for (const [id, meta] of entries) {
			if (id === "custom") continue;
			expect(meta.name.toLowerCase()).toBe(id);
		}
	});
});

describe("getTemplatesForKind", () => {
	it("returns only the 16 CV templates for kind: resume, including custom", () => {
		const ids = getTemplatesForKind("resume")
			.map(([id]) => id)
			.sort();
		expect(ids).toEqual(
			[
				"azurill",
				"bronzor",
				"chikorita",
				"custom",
				"ditgar",
				"ditto",
				"gengar",
				"glalie",
				"kakuna",
				"lapras",
				"leafish",
				"meowth",
				"onyx",
				"pikachu",
				"rhyhorn",
				"scizor",
			].sort(),
		);
	});

	it("returns the 5 dedicated cover-letter templates plus custom for kind: cover-letter", () => {
		const ids = getTemplatesForKind("cover-letter")
			.map(([id]) => id)
			.sort();
		expect(ids).toEqual(["custom", "eevee", "espeon", "snorlax", "togepi", "vulpix"].sort());
	});
});
