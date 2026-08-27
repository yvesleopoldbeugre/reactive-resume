import type { Template } from "@reactive-resume/schema/templates";
import type { TemplatePage } from "../document";
import { AzurillPage } from "./azurill/AzurillPage";
import { BronzorPage } from "./bronzor/BronzorPage";
import { ChikoritaPage } from "./chikorita/ChikoritaPage";
import { CustomPage } from "./custom/CustomPage";
import { DitgarPage } from "./ditgar/DitgarPage";
import { DittoPage } from "./ditto/DittoPage";
import { EeveePage } from "./eevee/EeveePage";
import { EspeonPage } from "./espeon/EspeonPage";
import { GengarPage } from "./gengar/GengarPage";
import { GlaliePage } from "./glalie/GlaliePage";
import { KakunaPage } from "./kakuna/KakunaPage";
import { LaprasPage } from "./lapras/LaprasPage";
import { LeafishPage } from "./leafish/LeafishPage";
import { MeowthPage } from "./meowth/MeowthPage";
import { OnyxPage } from "./onyx/OnyxPage";
import { PikachuPage } from "./pikachu/PikachuPage";
import { RhyhornPage } from "./rhyhorn/RhyhornPage";
import { ScizorPage } from "./scizor/ScizorPage";
import { SnorlaxPage } from "./snorlax/SnorlaxPage";
import { TogepiPage } from "./togepi/TogepiPage";
import { VulpixPage } from "./vulpix/VulpixPage";

export const templatePages: Partial<Record<Template, TemplatePage>> = {
	azurill: AzurillPage,
	bronzor: BronzorPage,
	chikorita: ChikoritaPage,
	custom: CustomPage,
	ditgar: DitgarPage,
	ditto: DittoPage,
	eevee: EeveePage,
	espeon: EspeonPage,
	gengar: GengarPage,
	glalie: GlaliePage,
	kakuna: KakunaPage,
	lapras: LaprasPage,
	leafish: LeafishPage,
	meowth: MeowthPage,
	onyx: OnyxPage,
	pikachu: PikachuPage,
	rhyhorn: RhyhornPage,
	scizor: ScizorPage,
	snorlax: SnorlaxPage,
	togepi: TogepiPage,
	vulpix: VulpixPage,
};

const defaultTemplatePage = AzurillPage;

export const getTemplatePage = (template: Template): TemplatePage => templatePages[template] ?? defaultTemplatePage;
