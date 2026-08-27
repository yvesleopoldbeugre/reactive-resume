<div align="center">
  <h1>Essor</h1>

  <p>Essor est un créateur de CV moderne qui vous aide à construire, personnaliser et partager un CV professionnel en quelques minutes.</p>
</div>

---

Pick a template, fill in your details, and export to PDF. Essor is built on top of [Reactive Resume](https://github.com/amruthpillai/reactive-resume) (MIT-licensed), with its own visual identity and product direction.

## Features

**Resume Building**

- Real-time preview as you type
- Multiple export formats (PDF, JSON, DOCX)
- Drag-and-drop section ordering
- Custom sections for any content type
- Rich text editor with formatting support

**Templates**

- Professionally designed templates
- A4 and Letter size support
- Customizable colors, fonts, and spacing
- Structured Style Rules for section and text styling

**Privacy & Control**

- Self-host on your own infrastructure
- No tracking or analytics by default
- Full data export at any time
- Delete your data permanently with one click

**Extras**

- AI integration (OpenAI, Google Gemini, Anthropic Claude)
- Multi-language support
- Share resumes via unique links
- Import from JSON Resume format
- Dark mode support
- Passkey and two-factor authentication

## Templates

<table>
  <tr>
    <td align="center">
      <img src="apps/web/public/templates/jpg/azurill.jpg" alt="Azurill" width="150" />
      <br /><sub><b>Azurill</b></sub>
    </td>
    <td align="center">
      <img src="apps/web/public/templates/jpg/bronzor.jpg" alt="Bronzor" width="150" />
      <br /><sub><b>Bronzor</b></sub>
    </td>
    <td align="center">
      <img src="apps/web/public/templates/jpg/chikorita.jpg" alt="Chikorita" width="150" />
      <br /><sub><b>Chikorita</b></sub>
    </td>
    <td align="center">
      <img src="apps/web/public/templates/jpg/ditto.jpg" alt="Ditto" width="150" />
      <br /><sub><b>Ditto</b></sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="apps/web/public/templates/jpg/gengar.jpg" alt="Gengar" width="150" />
      <br /><sub><b>Gengar</b></sub>
    </td>
    <td align="center">
      <img src="apps/web/public/templates/jpg/glalie.jpg" alt="Glalie" width="150" />
      <br /><sub><b>Glalie</b></sub>
    </td>
    <td align="center">
      <img src="apps/web/public/templates/jpg/kakuna.jpg" alt="Kakuna" width="150" />
      <br /><sub><b>Kakuna</b></sub>
    </td>
    <td align="center">
      <img src="apps/web/public/templates/jpg/lapras.jpg" alt="Lapras" width="150" />
      <br /><sub><b>Lapras</b></sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="apps/web/public/templates/jpg/leafish.jpg" alt="Leafish" width="150" />
      <br /><sub><b>Leafish</b></sub>
    </td>
    <td align="center">
      <img src="apps/web/public/templates/jpg/onyx.jpg" alt="Onyx" width="150" />
      <br /><sub><b>Onyx</b></sub>
    </td>
    <td align="center">
      <img src="apps/web/public/templates/jpg/pikachu.jpg" alt="Pikachu" width="150" />
      <br /><sub><b>Pikachu</b></sub>
    </td>
    <td align="center">
      <img src="apps/web/public/templates/jpg/rhyhorn.jpg" alt="Rhyhorn" width="150" />
      <br /><sub><b>Rhyhorn</b></sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="apps/web/public/templates/jpg/ditgar.jpg" alt="Ditgar" width="150" />
      <br /><sub><b>Ditgar</b></sub>
    </td>
    <td align="center">
      <img src="apps/web/public/templates/jpg/meowth.jpg" alt="Meowth" width="150" />
      <br /><sub><b>Meowth</b></sub>
    </td>
    <td align="center">
      <img src="apps/web/public/templates/jpg/scizor.jpg" alt="Scizor" width="150" />
      <br /><sub><b>Scizor</b></sub>
    </td>
  </tr>
</table>

## Quick Start

The quickest way to run Essor locally:

```bash
# Start all services
docker compose up -d

# Access the app
open http://localhost:3000
```

See `AGENTS.md` for the full local development setup (pnpm workspaces, Postgres, environment variables).

## Tech Stack

| Category         | Technology                      |
| ----------------- | -------------------------------- |
| Framework        | TanStack Start (React 19, Vite) |
| Runtime          | Node.js                         |
| Language         | TypeScript                      |
| Database         | PostgreSQL with Drizzle ORM     |
| API              | ORPC (Type-safe RPC)            |
| Auth             | Better Auth                     |
| Styling          | Tailwind CSS                    |
| UI Components    | Base UI + shadcn-style package  |
| State Management | Zustand + TanStack Query        |

## Self-Hosting

Essor can be self-hosted using Docker. The stack includes:

- **PostgreSQL** — Database for storing user data and resumes
- **SeaweedFS** (optional) — S3-compatible storage for file uploads

PDF generation runs entirely client-side via `@react-pdf/renderer` — no Browserless, Chromium, or external print service is required.

Build the image from this repository:

```bash
docker build -t essor .
```

## License

Essor is built on top of [Reactive Resume](https://github.com/amruthpillai/reactive-resume), used under the [MIT license](./LICENSE). Modifications and additions made for Essor are also released under MIT.
