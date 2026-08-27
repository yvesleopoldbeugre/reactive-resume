import { describe, expect, it } from "vitest";
import { defaultSkin, skinSchema } from "./skin";

describe("skinSchema", () => {
	it("accepts the default skin", () => {
		expect(skinSchema.safeParse(defaultSkin).success).toBe(true);
	});

	it("accepts a fully custom combination", () => {
		const result = skinSchema.safeParse({
			skeleton: "stacked",
			header: { placement: "sidebar", align: "start", picturePlacement: "none" },
			sidebar: { position: "after", fill: "tint", tintOpacity: 0.4, foreground: "inverted" },
			heading: { decoration: "uppercase" },
			divider: "top-bar",
		});
		expect(result.success).toBe(true);
	});

	it("falls back to defaults for invalid enum values instead of rejecting", () => {
		const result = skinSchema.safeParse({
			skeleton: "not-a-skeleton",
			header: { placement: "full-width", align: "center", picturePlacement: "block-start" },
			sidebar: { position: "before", fill: "none", tintOpacity: 0.2, foreground: "default" },
			heading: { decoration: "plain" },
			divider: "none",
		});
		expect(result.success).toBe(true);
		expect(result.data?.skeleton).toBe("columns");
	});

	it("clamps tintOpacity out of range via catch", () => {
		const result = skinSchema.safeParse({
			...defaultSkin,
			sidebar: { ...defaultSkin.sidebar, tintOpacity: 5 },
		});
		expect(result.success).toBe(true);
		expect(result.data?.sidebar.tintOpacity).toBe(0.2);
	});

	it("rejects missing required nested objects", () => {
		const result = skinSchema.safeParse({ skeleton: "columns" });
		expect(result.success).toBe(false);
	});
});
