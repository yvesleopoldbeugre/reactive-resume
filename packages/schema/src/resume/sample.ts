import type { Locale } from "@reactive-resume/utils/locale";
import type { ResumeData } from "./data";

export const sampleResumeData: ResumeData = {
	picture: {
		hidden: false,
		url: "/photos/sample-picture.jpg",
		size: 100,
		rotation: 0,
		aspectRatio: 1,
		borderRadius: 0,
		borderColor: "rgba(0, 0, 0, 0.5)",
		borderWidth: 0,
		shadowColor: "rgba(0, 0, 0, 0.5)",
		shadowWidth: 0,
	},
	basics: {
		name: "David Kowalski",
		headline: "Game Developer | Unity & Unreal Engine Specialist",
		email: "david.kowalski@email.com",
		phone: "+1 (555) 291-4756",
		location: "Seattle, WA",
		website: {
			url: "https://davidkowalski.games",
			label: "davidkowalski.games",
		},
		customFields: [
			{
				id: "019bef5a-0477-77e0-968b-5d0e2ecb34e3",
				icon: "github-logo",
				text: "github.com/dkowalski-dev",
				link: "https://github.com/dkowalski-dev",
			},
			{
				id: "019bef5a-93e4-7746-ad39-3a132360f823",
				icon: "game-controller",
				text: "itch.io/dkowalski",
				link: "https://itch.io/dkowalski",
			},
		],
	},
	summary: {
		title: "",
		icon: "article",
		columns: 1,
		hidden: false,
		keepTogether: false,
		startOnNewPage: false,
		content:
			"<p><strong>Passionate game developer with 5+ years of professional experience</strong> creating engaging gameplay systems and polished player experiences across multiple platforms. Specialized in Unity and Unreal Engine with strong expertise in C#, C++, and game design principles. Proven ability to collaborate effectively with cross-functional teams including designers, artists, and QA to deliver high-quality games on time and within scope.</p>",
	},
	sections: {
		profiles: {
			title: "",
			icon: "messenger-logo",
			columns: 1,
			hidden: false,
			keepTogether: false,
			startOnNewPage: false,
			items: [
				{
					id: "019bef5a-93e4-7746-ad39-3d42ddc9b4d8",
					hidden: false,
					icon: "github-logo",
					iconColor: "",
					network: "GitHub",
					username: "dkowalski-dev",
					website: {
						url: "https://github.com/dkowalski-dev",
						label: "github.com/dkowalski-dev",
						inlineLink: false,
					},
				},
				{
					id: "019bef5a-93e4-7746-ad39-43c470b77f4a",
					hidden: false,
					icon: "linkedin-logo",
					iconColor: "",
					network: "LinkedIn",
					username: "davidkowalski",
					website: {
						url: "https://linkedin.com/in/davidkowalski",
						label: "linkedin.com/in/davidkowalski",
						inlineLink: false,
					},
				},
			],
		},
		experience: {
			title: "",
			icon: "briefcase",
			columns: 1,
			hidden: false,
			keepTogether: false,
			startOnNewPage: false,
			items: [
				{
					id: "019bef5a-93e4-7746-ad39-44d8cec98ca4",
					hidden: false,
					company: "Cascade Studios",
					position: "Senior Game Developer",
					location: "Seattle, WA",
					period: "March 2022 - Present",
					website: {
						url: "",
						label: "",
						inlineLink: false,
					},
					roles: [],
					description:
						"<ul><li><p>Lead gameplay programmer on an unannounced AAA action-adventure title built in Unreal Engine 5 for PC and next-gen consoles</p></li><li><p>Architected and implemented core combat system including hit detection, combo mechanics, and enemy AI behavior trees serving 15+ enemy types</p></li><li><p>Developed custom editor tools in C++ that reduced level designer iteration time by 40% and improved workflow efficiency across the team</p></li><li><p>Optimized rendering pipeline and gameplay systems to maintain 60 FPS performance target on all supported platforms, achieving 95% frame rate stability</p></li><li><p>Ad nostrud enim adipisicing ea proident aliqua veniam nisi amet ea irure et mollit.</p></li></ul><p></p>",
				},
			],
		},
		education: {
			title: "",
			icon: "graduation-cap",
			columns: 1,
			hidden: false,
			keepTogether: false,
			startOnNewPage: false,
			items: [
				{
					id: "019bef5a-93e4-7746-ad39-48455f6cef9e",
					hidden: false,
					school: "University of Washington",
					degree: "Bachelor of Science",
					area: "Computer Science",
					grade: "3.6 GPA",
					location: "Seattle, WA",
					period: "2014 - 2018",
					website: {
						url: "",
						label: "",
						inlineLink: false,
					},
					description:
						"<p>Concentration in Game Development. Relevant Coursework: Game Engine Architecture, Computer Graphics, Artificial Intelligence, Physics Simulation, 3D Mathematics, Software Engineering, Data Structures & Algorithms</p>",
				},
			],
		},
		projects: {
			title: "",
			icon: "code-simple",
			columns: 1,
			hidden: false,
			keepTogether: false,
			startOnNewPage: false,
			items: [
				{
					id: "019bef5a-93e4-7746-ad39-4d2603fe2801",
					hidden: false,
					name: "Echoes of the Void (Indie Game)",
					period: "2023 - Present",
					website: {
						url: "https://itch.io/echoes-of-the-void",
						label: "View on itch.io",
						inlineLink: false,
					},
					description:
						"<p>Solo developer for a narrative-driven 2D platformer built in Unity. Features custom dialogue system, branching story paths, and atmospheric pixel art. Currently in development with demo released on itch.io garnering 5K+ downloads and positive community feedback. Planned Steam release Q2 2025.</p>",
				},
				{
					id: "019bef5a-93e4-7746-ad39-524195dd7eff",
					hidden: false,
					name: "Open Source: Unity Dialogue Framework",
					period: "2021 - 2023",
					website: {
						url: "https://github.com/dkowalski-dev/unity-dialogue",
						label: "View on GitHub",
						inlineLink: false,
					},
					description:
						"<p>Created and maintain an open-source dialogue system for Unity with visual node-based editor, localization support, and voice acting integration. Project has 800+ GitHub stars and is actively used by indie developers worldwide. Includes comprehensive documentation and example projects.</p>",
				},
				{
					id: "019bef5a-93e4-7746-ad39-549106273c73",
					hidden: false,
					name: "Game Jam Participation",
					period: "2019 - Present",
					website: {
						url: "",
						label: "",
						inlineLink: false,
					},
					description:
						"<p>Regular participant in Ludum Dare and Global Game Jam events. Created 12+ game prototypes exploring experimental mechanics and art styles. Won 'Best Gameplay' award at Ludum Dare 48 with puzzle game 'Deeper and Deeper' that ranked in top 5% overall.</p>",
				},
			],
		},
		skills: {
			title: "",
			icon: "compass-tool",
			columns: 1,
			hidden: false,
			keepTogether: false,
			startOnNewPage: false,
			items: [
				{
					id: "019bef5a-93e4-7746-ad39-5a52dcf50ed4",
					hidden: false,
					icon: "code",
					iconColor: "",
					name: "Unity Engine",
					proficiency: "Expert",
					level: 5,
					keywords: ["C#", "Editor Tools", "Performance Profiling"],
				},
				{
					id: "019bef5a-93e4-7746-ad39-5e8bb7cacbc8",
					hidden: false,
					icon: "brackets-curly",
					iconColor: "",
					name: "Unreal Engine",
					proficiency: "Advanced",
					level: 4,
					keywords: ["C++", "Blueprints", "UE5 Features"],
				},
				{
					id: "019bef5a-93e4-7746-ad39-622f9d41da55",
					hidden: false,
					icon: "cpu",
					iconColor: "",
					name: "Programming Languages",
					proficiency: "Expert",
					level: 5,
					keywords: ["C#", "C++", "Python", "HLSL/GLSL"],
				},
				{
					id: "019bef5a-93e4-7746-ad39-6574ab6814bd",
					hidden: false,
					icon: "brain",
					iconColor: "",
					name: "Game AI",
					proficiency: "Advanced",
					level: 4,
					keywords: ["Behavior Trees", "FSM", "Pathfinding", "Navigation"],
				},
				{
					id: "019bef5a-93e4-7746-ad39-6a8e22bec684",
					hidden: false,
					icon: "shooting-star",
					iconColor: "",
					name: "Physics & Mathematics",
					proficiency: "Advanced",
					level: 4,
					keywords: ["3D Math", "Collision Detection", "Rigid Body Dynamics"],
				},
				{
					id: "019bef5a-93e4-7746-ad39-6d8bf7be7514",
					hidden: true,
					icon: "chart-line-up",
					iconColor: "",
					name: "Performance Optimization",
					proficiency: "Advanced",
					level: 4,
					keywords: ["Profiling", "Memory Management", "Frame Rate"],
				},
			],
		},
		languages: {
			title: "",
			icon: "translate",
			columns: 1,
			hidden: false,
			keepTogether: false,
			startOnNewPage: false,
			items: [
				{
					id: "019bef5a-93e4-7746-ad39-73807ccc48b5",
					hidden: false,
					language: "English",
					fluency: "Native",
					level: 5,
				},
				{
					id: "019bef5a-93e4-7746-ad39-768670459358",
					hidden: false,
					language: "Polish",
					fluency: "Conversational",
					level: 3,
				},
			],
		},
		interests: {
			title: "",
			icon: "football",
			columns: 1,
			hidden: false,
			keepTogether: false,
			startOnNewPage: false,
			items: [
				{
					id: "019bef5a-93e4-7746-ad39-7821b4de95f7",
					hidden: false,
					icon: "game-controller",
					iconColor: "",
					name: "Game Design",
					keywords: ["Mechanics", "Level Design", "Player Psychology"],
				},
				{
					id: "019bef5a-93e4-7746-ad39-7c64c1a607d3",
					hidden: false,
					icon: "robot",
					iconColor: "",
					name: "AI & Procedural Generation",
					keywords: ["PCG", "Machine Learning", "Emergent Gameplay"],
				},
				{
					id: "019bef5a-93e4-7746-ad39-80bccce3c0ef",
					hidden: false,
					icon: "book-open",
					iconColor: "",
					name: "Indie Game Development",
					keywords: ["Solo Dev", "Game Jams", "Community"],
				},
				{
					id: "019bef5a-93e4-7746-ad39-84bb7e9af005",
					hidden: false,
					icon: "pen-nib",
					iconColor: "",
					name: "Technical Art",
					keywords: ["Shaders", "VFX", "Optimization"],
				},
			],
		},
		awards: {
			title: "",
			icon: "trophy",
			columns: 1,
			hidden: false,
			keepTogether: false,
			startOnNewPage: false,
			items: [
				{
					id: "019bef5a-93e4-7746-ad39-8a8bb9fbe182",
					hidden: false,
					title: "Best Gameplay - Ludum Dare 48",
					awarder: "Ludum Dare",
					date: "April 2021",
					website: {
						url: "",
						label: "",
						inlineLink: false,
					},
					description:
						"<p>Awarded for puzzle game 'Deeper and Deeper' which ranked in the top 5% overall among 3,000+ submissions</p>",
				},
				{
					id: "019bef5a-93e4-7746-ad39-8dd81379c7c9",
					hidden: false,
					title: "Employee Excellence Award",
					awarder: "Pixel Forge Interactive",
					date: "December 2021",
					website: {
						url: "",
						label: "",
						inlineLink: false,
					},
					description:
						"<p>Recognized for exceptional contributions to 'Starbound Odyssey' development and dedication to code quality</p>",
				},
			],
		},
		certifications: {
			title: "",
			icon: "certificate",
			columns: 1,
			hidden: false,
			keepTogether: false,
			startOnNewPage: false,
			items: [
				{
					id: "019bef5a-93e4-7746-ad39-91fe8a4dfea6",
					hidden: false,
					title: "Unity Certified Expert: Programmer",
					issuer: "Unity Technologies",
					date: "March 2022",
					website: {
						url: "",
						label: "",
						inlineLink: false,
					},
					description: "",
				},
				{
					id: "019bef5a-93e4-7746-ad39-961afccc2508",
					hidden: false,
					title: "Unreal Engine 5 C++ Developer",
					issuer: "Epic Games (Udemy)",
					date: "June 2023",
					website: {
						url: "",
						label: "",
						inlineLink: false,
					},
					description: "",
				},
			],
		},
		publications: {
			title: "",
			icon: "books",
			columns: 1,
			hidden: false,
			keepTogether: false,
			startOnNewPage: false,
			items: [
				{
					id: "019bef5a-93e4-7746-ad39-9816f0081895",
					hidden: false,
					title: "Optimizing Unity Games for Mobile: A Practical Guide",
					publisher: "Game Developer Magazine",
					date: "September 2021",
					website: {
						url: "",
						label: "",
						inlineLink: false,
					},
					description:
						"<p>Technical article covering mobile optimization techniques including draw call batching, LOD systems, and memory management</p>",
				},
				{
					id: "019bef5a-93e4-7746-ad39-9cf55c272c05",
					hidden: false,
					title: "Building Modular Dialogue Systems",
					publisher: "Seattle Indie Game Developers Meetup",
					date: "May 2022",
					website: {
						url: "",
						label: "",
						inlineLink: false,
					},
					description:
						"<p>Presented talk on designing flexible dialogue systems for narrative games, attended by 60+ local developers</p>",
				},
			],
		},
		volunteer: {
			title: "",
			icon: "hand-heart",
			columns: 2,
			hidden: false,
			keepTogether: false,
			startOnNewPage: false,
			items: [
				{
					id: "019bef5a-93e4-7746-ad39-a02580473e05",
					hidden: false,
					organization: "Seattle Indies",
					location: "Seattle, WA",
					period: "2020 - Present",
					website: {
						url: "",
						label: "",
						inlineLink: false,
					},
					description:
						"<p>Active member of local indie game development community. Organize monthly game showcases and provide mentorship to aspiring game developers through code reviews and technical guidance.</p>",
				},
				{
					id: "019bef5a-93e4-7746-ad39-a731c5b1b286",
					hidden: false,
					organization: "Code.org Game Development Workshops",
					location: "Seattle, WA",
					period: "2021 - Present",
					website: {
						url: "",
						label: "",
						inlineLink: false,
					},
					description:
						"<p>Volunteer instructor teaching basic game programming concepts to middle school students. Led 8+ workshops introducing Unity fundamentals and game design principles.</p>",
				},
			],
		},
		references: {
			title: "",
			icon: "phone",
			columns: 1,
			hidden: false,
			keepTogether: false,
			startOnNewPage: false,
			items: [
				{
					id: "019bef5a-93e4-7746-ad39-a945c0f42dd5",
					hidden: false,
					name: "Available upon request",
					position: "",
					website: {
						url: "",
						label: "",
						inlineLink: false,
					},
					phone: "",
					description: "",
				},
			],
		},
	},
	customSections: [
		{
			title: "",
			icon: "briefcase",
			columns: 1,
			hidden: false,
			keepTogether: false,
			startOnNewPage: false,
			id: "019becaf-0b87-769d-98a6-46ccf558c0e8",
			type: "experience",
			items: [
				{
					id: "019bef5a-d1fa-7289-a87c-2677688d9e75",
					hidden: false,
					company: "Pixel Forge Interactive",
					position: "Game Developer",
					location: "Bellevue, WA",
					period: "June 2020 - February 2022",
					website: {
						url: "",
						label: "",
						inlineLink: false,
					},
					roles: [],
					description:
						"<ul><li>Core developer on 'Starbound Odyssey,' a sci-fi roguelike that achieved 500K+ sales on Steam with 'Very Positive' user reviews</li><li>Implemented procedural generation systems for level layouts, enemy encounters, and loot drops using Unity and C#</li><li>Designed and programmed player progression systems including skill trees, equipment upgrades, and meta-progression mechanics</li><li>Created robust save/load system supporting cloud saves and cross-platform play between PC and Nintendo Switch</li><li>Integrated third-party SDKs for analytics (GameAnalytics), achievements (Steamworks), and multiplayer networking (Photon)</li><li>Fixed critical bugs and balanced gameplay based on community feedback and telemetry data, releasing 12 post-launch content updates</li><li>Worked closely with artists to implement VFX, animations, and shaders that enhanced visual polish while maintaining performance targets</li></ul>",
				},
				{
					id: "019bef5a-db0e-73c6-9b6e-4471703864f1",
					hidden: false,
					company: "Mobile Games Studio",
					position: "Junior Game Developer",
					location: "Remote",
					period: "September 2018 - May 2020",
					website: {
						url: "",
						label: "",
						inlineLink: false,
					},
					roles: [],
					description:
						"<ul><li><p>Contributed to development of three mobile puzzle games built in Unity, collectively downloaded 2M+ times on iOS and Android</p></li><li><p>Implemented UI systems, touch controls, and gesture recognition optimized for mobile devices and various screen sizes</p></li><li><p>Developed monetization features including rewarded video ads, in-app purchases, and daily reward systems that increased retention by 25%</p></li><li><p>Optimized memory usage and load times for mobile platforms, reducing app size by 35% through asset compression and code optimization</p></li><li><p>Collaborated with game designers to balance puzzle difficulty curves and progression pacing using A/B testing data</p></li></ul><p></p>",
				},
			],
		},
		{
			title: "Cover Letter",
			icon: "envelope-simple",
			columns: 1,
			hidden: false,
			keepTogether: false,
			startOnNewPage: false,
			id: "019bef5b-0b3d-7e2a-8a7c-12d9e23a4f6b",
			type: "cover-letter",
			items: [
				{
					id: "019bef5b-0f8d-77d1-9b2a-4a1b65e1b8a1",
					hidden: false,
					partType: "recipient",
					content:
						'<p>Hiring Manager<br />Sunrise Games Studio<br />Seattle, WA<br /><a href="mailto:hiring@sunrisegames.com">hiring@sunrisegames.com</a></p>',
				},
				{
					id: "019bef5b-0f8d-77d1-9b2a-4a1b65e1b8a2",
					hidden: false,
					partType: "subject",
					content: "<p>Subject: Application for the Senior Gameplay Engineer position</p>",
				},
				{
					id: "019bef5b-0f8d-77d1-9b2a-4a1b65e1b8a3",
					hidden: false,
					partType: "salutation",
					content: "<p>Dear Hiring Manager,</p>",
				},
				{
					id: "019bef5b-0f8d-77d1-9b2a-4a1b65e1b8a4",
					hidden: false,
					partType: "paragraph",
					content:
						"<p>I'm excited to apply for the Senior Gameplay Engineer role at Sunrise Games Studio. Over the past five years, I have shipped cross-platform titles in Unity and Unreal Engine, leading core gameplay and tooling efforts that improved iteration speed and player experience.</p>",
				},
				{
					id: "019bef5b-0f8d-77d1-9b2a-4a1b65e1b8a5",
					hidden: false,
					partType: "paragraph",
					content:
						"<p>At Cascade Studios, I architected combat systems and optimized performance to maintain 60 FPS on console while partnering closely with design and art.</p>",
				},
				{
					id: "019bef5b-0f8d-77d1-9b2a-4a1b65e1b8a6",
					hidden: false,
					partType: "paragraph",
					content: "<p>I thrive in collaborative, cross-disciplinary teams and enjoy mentoring junior engineers.</p>",
				},
				{
					id: "019bef5b-0f8d-77d1-9b2a-4a1b65e1b8a7",
					hidden: false,
					partType: "closing",
					content:
						"<p>I'd welcome the chance to bring my gameplay systems expertise and tooling focus to your next title.</p>",
				},
				{
					id: "019bef5b-0f8d-77d1-9b2a-4a1b65e1b8a8",
					hidden: false,
					partType: "signature",
					content: "<p>Sincerely,<br />David Kowalski</p>",
				},
			],
		},
	],
	metadata: {
		template: "azurill",
		layout: {
			sidebarWidth: 30,
			pages: [
				{
					fullWidth: false,
					main: ["summary", "education", "experience"],
					sidebar: ["profiles", "skills"],
				},
				{
					fullWidth: false,
					main: ["019becaf-0b87-769d-98a6-46ccf558c0e8", "awards"],
					sidebar: ["certifications", "languages", "interests", "references"],
				},
				{
					fullWidth: true,
					main: ["projects", "publications", "volunteer"],
					sidebar: [],
				},
				{
					fullWidth: true,
					main: ["019bef5b-0b3d-7e2a-8a7c-12d9e23a4f6b"],
					sidebar: [],
				},
			],
		},
		page: {
			gapX: 12,
			gapY: 8,
			marginX: 16,
			marginY: 16,
			format: "a4",
			locale: "en-US",
			hideLinkUnderline: false,
			hideIcons: false,
			hideSectionIcons: false,
		},
		design: {
			level: {
				icon: "star",
				type: "icon",
			},
			colors: {
				primary: "rgba(0, 132, 209, 1)",
				text: "rgba(0, 0, 0, 1)",
				background: "rgba(255, 255, 255, 1)",
			},
		},
		typography: {
			body: {
				fontFamily: "IBM Plex Serif",
				fontWeights: ["400", "600"],
				fontSize: 10,
				lineHeight: 1.5,
			},
			heading: {
				fontFamily: "Fira Sans Condensed",
				fontWeights: ["500"],
				fontSize: 12,
				lineHeight: 1.5,
			},
		},
		notes: "",
		styleRules: [],
	},
};

// French text overrides, applied by position via `.map()` below (never by array indexing)
// so translating a field never risks an out-of-bounds / possibly-undefined access.
const experienceDescriptionsFr = [
	"<ul><li><p>Programmeur gameplay principal sur un titre action-aventure AAA non annoncé, développé sous Unreal Engine 5 pour PC et consoles nouvelle génération</p></li><li><p>Conception et implémentation du système de combat principal, incluant la détection de coups, les enchaînements et l'IA ennemie couvrant plus de 15 types d'ennemis</p></li><li><p>Développement d'outils d'éditeur personnalisés en C++ ayant réduit de 40 % le temps d'itération des level designers et amélioré l'efficacité globale de l'équipe</p></li><li><p>Optimisation du pipeline de rendu et des systèmes de gameplay pour maintenir 60 FPS sur toutes les plateformes cibles, avec 95 % de stabilité du framerate</p></li><li><p>Ad nostrud enim adipisicing ea proident aliqua veniam nisi amet ea irure et mollit.</p></li></ul><p></p>",
];

const educationOverridesFr = [
	{
		degree: "Licence de Sciences",
		description:
			"<p>Spécialisation en développement de jeux vidéo. Matières principales : architecture de moteur de jeu, infographie, intelligence artificielle, simulation physique, mathématiques 3D, génie logiciel, structures de données et algorithmes</p>",
	},
];

const projectOverridesFr = [
	{
		websiteLabel: "Voir sur itch.io",
		description:
			"<p>Développeur solo d'un jeu de plateforme 2D narratif sous Unity. Système de dialogue personnalisé, embranchements narratifs et pixel art atmosphérique. Actuellement en développement, avec une démo publiée sur itch.io ayant dépassé 5 000 téléchargements et reçu des retours communautaires positifs. Sortie Steam prévue au T2 2025.</p>",
	},
	{
		websiteLabel: "Voir sur GitHub",
		description:
			"<p>Création et maintenance d'un framework de dialogue open-source pour Unity, avec éditeur visuel par nœuds, support de la localisation et intégration de doublages. Le projet compte plus de 800 étoiles GitHub et est activement utilisé par des studios indépendants dans le monde entier. Documentation et exemples de projets inclus.</p>",
	},
	{
		websiteLabel: "",
		description:
			"<p>Participant régulier aux game jams Ludum Dare et Global Game Jam. Création de plus de 12 prototypes explorant des mécaniques et styles artistiques expérimentaux. Prix « Meilleur Gameplay » au Ludum Dare 48 avec le jeu de réflexion « Deeper and Deeper », classé dans le top 5 % général.</p>",
	},
];

const languageOverridesFr = [
	{ language: "Anglais", fluency: "Langue maternelle" },
	{ language: "Polonais", fluency: "Conversationnel" },
];

const interestOverridesFr = [
	{ name: "Game Design", keywords: ["Mécaniques", "Level Design", "Psychologie du joueur"] },
	{ name: "IA & Génération Procédurale", keywords: ["PCG", "Machine Learning", "Gameplay émergent"] },
	{ name: "Développement de jeux indépendants", keywords: ["Solo Dev", "Game Jams", "Communauté"] },
	{ name: "Art technique", keywords: ["Shaders", "VFX", "Optimisation"] },
];

const awardOverridesFr = [
	{
		title: "Meilleur Gameplay - Ludum Dare 48",
		description:
			"<p>Prix décerné pour le jeu de réflexion « Deeper and Deeper », classé dans le top 5 % général parmi plus de 3 000 participations</p>",
	},
	{
		title: "Prix d'Excellence Employé",
		description:
			"<p>Récompense pour contribution exceptionnelle au développement de « Starbound Odyssey » et pour l'exigence de qualité du code</p>",
	},
];

const publicationOverridesFr = [
	{
		title: "Optimiser les jeux Unity pour mobile : un guide pratique",
		description:
			"<p>Article technique sur les techniques d'optimisation mobile : regroupement des appels de rendu, systèmes de LOD et gestion de la mémoire</p>",
	},
	{
		title: "Construire des systèmes de dialogue modulaires",
		description:
			"<p>Présentation sur la conception de systèmes de dialogue flexibles pour jeux narratifs, devant plus de 60 développeurs locaux</p>",
	},
];

const volunteerDescriptionsFr = [
	"<p>Membre actif de la communauté locale de développement de jeux indépendants. Organisation de vitrines mensuelles et mentorat de développeurs en herbe via revues de code et conseils techniques.</p>",
	"<p>Instructeur bénévole enseignant les bases de la programmation de jeux vidéo à des collégiens. Animation de plus de 8 ateliers d'introduction à Unity et aux principes de game design.</p>",
];

const secondExperienceDescriptionsFr = [
	"<ul><li>Développeur principal sur « Starbound Odyssey », un rogue-like de science-fiction ayant dépassé 500 000 ventes sur Steam avec des avis « Très positifs »</li><li>Mise en œuvre de systèmes de génération procédurale pour les niveaux, les rencontres ennemies et le butin, sous Unity et C#</li><li>Conception et programmation des systèmes de progression du joueur : arbres de compétences, améliorations d'équipement et mécaniques de méta-progression</li><li>Création d'un système de sauvegarde robuste avec sauvegardes cloud et jeu croisé entre PC et Nintendo Switch</li><li>Intégration de SDK tiers pour l'analytique (GameAnalytics), les succès (Steamworks) et le réseau multijoueur (Photon)</li><li>Correction de bugs critiques et équilibrage du gameplay selon les retours communautaires et la télémétrie, avec 12 mises à jour post-lancement</li><li>Collaboration étroite avec les artistes pour les VFX, animations et shaders, en préservant les performances cibles</li></ul>",
	"<ul><li><p>Contribution au développement de trois jeux de réflexion mobiles sous Unity, cumulant plus de 2 M de téléchargements sur iOS et Android</p></li><li><p>Mise en œuvre de systèmes d'interface, de contrôles tactiles et de reconnaissance de gestes optimisés pour mobile</p></li><li><p>Développement de fonctionnalités de monétisation (publicités récompensées, achats intégrés, récompenses quotidiennes) ayant augmenté la rétention de 25 %</p></li><li><p>Optimisation de l'usage mémoire et des temps de chargement, réduisant la taille de l'application de 35 % via compression des assets et optimisation du code</p></li><li><p>Collaboration avec les game designers pour équilibrer les courbes de difficulté via des tests A/B</p></li></ul><p></p>",
];

/** Zips `items` with a same-length `overrides` array by position, without ever indexing either array directly. */
function zipOverrides<T, O extends object>(items: readonly T[], overrides: readonly O[]): (T & O)[] {
	return items.map((item, index) => ({ ...item, ...overrides[index] })) as (T & O)[];
}

/** Narrows a possibly-missing array element to `T`, failing loudly (not silently) if the fixture ever shrinks. */
function expectItem<T>(value: T | undefined, description: string): T {
	if (value === undefined) throw new Error(`sample.ts: expected ${description} to exist`);
	return value;
}

// Destructured once (not indexed inline below) so accessing them stays type-safe.
const [rawExpCustomSection, rawCoverLetterCustomSection] = sampleResumeData.customSections;
const expCustomSection = expectItem(rawExpCustomSection, "the second work-experience custom section");
const coverLetterCustomSection = expectItem(rawCoverLetterCustomSection, "the cover-letter custom section");

/** French translation of {@link sampleResumeData}, used when seeding sample content for fr-FR. */
export const sampleResumeDataFr: ResumeData = {
	...sampleResumeData,
	basics: {
		...sampleResumeData.basics,
		headline: "Développeur de jeux vidéo | Spécialiste Unity & Unreal Engine",
	},
	summary: {
		...sampleResumeData.summary,
		content:
			"<p><strong>Développeur de jeux vidéo passionné avec plus de 5 ans d'expérience professionnelle</strong>, créant des systèmes de gameplay engageants et des expériences joueur soignées sur de multiples plateformes. Spécialisé en Unity et Unreal Engine avec une forte expertise en C#, C++ et principes de game design. Capacité avérée à collaborer efficacement avec des équipes pluridisciplinaires (designers, artistes, QA) pour livrer des jeux de qualité dans les délais et le périmètre prévus.</p>",
	},
	sections: {
		...sampleResumeData.sections,
		experience: {
			...sampleResumeData.sections.experience,
			items: zipOverrides(
				sampleResumeData.sections.experience.items,
				experienceDescriptionsFr.map((description) => ({ description })),
			),
		},
		education: {
			...sampleResumeData.sections.education,
			items: zipOverrides(sampleResumeData.sections.education.items, educationOverridesFr),
		},
		projects: {
			...sampleResumeData.sections.projects,
			items: zipOverrides(sampleResumeData.sections.projects.items, projectOverridesFr).map((item) => ({
				...item,
				website: item.websiteLabel ? { ...item.website, label: item.websiteLabel } : item.website,
			})),
		},
		skills: {
			...sampleResumeData.sections.skills,
			items: sampleResumeData.sections.skills.items.map((item) => ({
				...item,
				proficiency: item.proficiency === "Expert" ? "Expert" : "Avancé",
			})),
		},
		languages: {
			...sampleResumeData.sections.languages,
			items: zipOverrides(sampleResumeData.sections.languages.items, languageOverridesFr),
		},
		interests: {
			...sampleResumeData.sections.interests,
			items: zipOverrides(sampleResumeData.sections.interests.items, interestOverridesFr),
		},
		awards: {
			...sampleResumeData.sections.awards,
			items: zipOverrides(sampleResumeData.sections.awards.items, awardOverridesFr),
		},
		publications: {
			...sampleResumeData.sections.publications,
			items: zipOverrides(sampleResumeData.sections.publications.items, publicationOverridesFr),
		},
		volunteer: {
			...sampleResumeData.sections.volunteer,
			items: zipOverrides(
				sampleResumeData.sections.volunteer.items,
				volunteerDescriptionsFr.map((description) => ({ description })),
			),
		},
		references: {
			...sampleResumeData.sections.references,
			items: zipOverrides(sampleResumeData.sections.references.items, [{ name: "Disponible sur demande" }]),
		},
	},
	// The first custom section is the second work experience block (Pixel Forge / Mobile Games
	// Studio); the second is the cover letter. Built from the destructured sections above so
	// nothing here indexes into the `customSections` array directly.
	customSections: [
		{
			...expCustomSection,
			items: zipOverrides(
				expCustomSection.items,
				secondExperienceDescriptionsFr.map((description) => ({ description })),
			),
		},
		{
			...coverLetterCustomSection,
			title: "Lettre de motivation",
			items: zipOverrides(coverLetterCustomSection.items, [
				{
					content:
						'<p>Responsable du recrutement<br />Sunrise Games Studio<br />Seattle, WA<br /><a href="mailto:hiring@sunrisegames.com">hiring@sunrisegames.com</a></p>',
				},
				{ content: "<p>Objet : Candidature au poste d'Ingénieur Gameplay Senior</p>" },
				{ content: "<p>Madame, Monsieur,</p>" },
				{
					content:
						"<p>Je suis ravi de postuler au poste d'Ingénieur Gameplay Senior chez Sunrise Games Studio. Au cours des cinq dernières années, j'ai livré des titres multiplateformes sous Unity et Unreal Engine, en dirigeant les efforts de gameplay et d'outillage qui ont amélioré la vitesse d'itération et l'expérience joueur.</p>",
				},
				{
					content:
						"<p>Chez Cascade Studios, j'ai conçu des systèmes de combat et optimisé les performances pour maintenir 60 FPS sur console, en étroite collaboration avec le design et l'art.</p>",
				},
				{
					content:
						"<p>Je m'épanouis dans des équipes collaboratives et pluridisciplinaires et j'aime accompagner les ingénieurs juniors.</p>",
				},
				{
					content:
						"<p>Je serais ravi d'apporter mon expertise en systèmes de gameplay et en outillage à votre prochain titre.</p>",
				},
				{ content: "<p>Cordialement,<br />David Kowalski</p>" },
			]),
		},
	],
	metadata: {
		...sampleResumeData.metadata,
		page: { ...sampleResumeData.metadata.page, locale: "fr-FR" },
	},
};

/** Picks the sample persona whose prose matches the given locale (falls back to English). */
const getBaseSampleResumeData = (locale?: Locale): ResumeData =>
	locale === "fr-FR" ? sampleResumeDataFr : sampleResumeData;

/**
 * Returns the sample resume for the given locale, optionally overriding `basics.name`/
 * `basics.email` so the seeded content reflects the account holder's real name/email
 * instead of the sample persona's. Every other field (headline, experience, skills, etc.)
 * stays fictional placeholder content for the user to edit or replace. When neither
 * override is given, the locale's default sample persona is returned unchanged.
 */
export const createSampleResumeData = (
	overrides?: { name?: string | undefined; email?: string | undefined },
	locale?: Locale,
): ResumeData => {
	const base = getBaseSampleResumeData(locale);
	const name = overrides?.name?.trim();
	const email = overrides?.email?.trim();
	if (!name && !email) return base;

	return {
		...base,
		basics: {
			...base.basics,
			...(name ? { name } : {}),
			...(email ? { email } : {}),
		},
	};
};
