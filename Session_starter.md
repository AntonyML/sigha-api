NEVER use emojis; keep responses professional, concise, technical; only comment complex logic; markdown only if requested.

ALWAYS prioritize MCP servers: backend/NestJS → filesystem, GitHub, memory; frontend/React → 21st, Magic UI, shadcn/ui, filesystem; docs → Upstash Conte; data → memory/knowledge graph, Puppeteer.

Auto-detect project type via package.json, file extensions, and folder structure; switch MCP tools accordingly; never explain selection unless asked.

Start sessions reading Session_starter.md, then README.md, then project files; update logs with Date | Summary using 2026-02-08.

Follow established coding standards, architectural decisions, and design patterns; maintain consistent style; reference project backend_nest_js_hogar_de_ancianos, type Node.js Application, stack - Node.js
- JavaScript/TypeScript
- NPM/Yarn
- Express/Fastify.

Expose workspace context using file references, selections, symbols; detect build systems, configs, scripts, testing frameworks, and adjust suggestions.

Break complex tasks into smaller steps; offer multiple approaches with trade-offs; confirm understanding before major changes.

Generate code matching style, naming, architecture; include error handling, validation, meaningful comments, and testable logic; never include secrets.

Maintain session memory, track technical constraints, solved problems, and MCP usage; leverage memory for continuity and productivity.

- Optimize prompts: be specific, define output format, split tasks, provide sample inputs/outputs, and allow Copilot to repeat tasks; support variables backend_nest_js_hogar_de_ancianos, Node.js Application, 2025-11-16, - Node.js
- JavaScript/TypeScript
- NPM/Yarn
- Express/Fastify, - `npm start`
- `npm run dev`
- `npm test`
- `npm install`.

## Session log

2025-11-15 | Fetched remote branches; pulled `dev` and `tony` branches and updated local copies to match origin. 
2025-11-15 | Searched for Selenium tests — none found; added a Selenium skeleton test for `Users` (`tests/selenium/UsersTest/users-selenium.spec.ts`) and a script `test:selenium:users` in `package.json`.
2025-11-16 | Reviewed `Session_starter.md` for project rules and patterns; updated session logging to include today's date and confirmed there is no `README.md` in the repository root. Next: continue exploring `src/` modules and update session log after implementing changes.
2025-11-16 | Implemented comprehensive Jenkins pipeline (`jenkins/tony/Jenkinsfile`): Triggered on `dev` branch merge, pulls code, pushes to test repository, installs dependencies, runs Jest and unit tests, sends email notifications with detailed status and logs on success/failure/unstable. Pipeline includes: checkout source, push to test repo, dependency install, Jest execution, unit test execution (users service), and conditional email alerts with HTML formatting to antony.mongelopez@ucr.ac.cr.
2026-02-08 | Reviewed Session_starter.md for project context, current status, and established patterns; prepared to maintain project continuity and follow documented technical decisions. Analyzed database schema and backend structure, identified missing modules (physiotherapy, psychology, social work, medical records), created general task list and specific progress files for implementation. Started implementation: created PhysiotherapySession entity in domain/nursing/, added PhysiotherapySessionRepository provider in nursing.providers.ts, created PhysiotherapyService in services/nursing/ and integrated into NursingModule, created PhysiotherapyController in controller/nursing/ and added to NursingModule, created DTOs (CreatePhysiotherapySessionDto, UpdatePhysiotherapySessionDto, PhysiotherapySessionFilterDto) in dto/nursing/ and integrated into controller. Resolved duplicate DTO error by renaming GenerateAuditReportDto to GenerateAuditReportRequestDto in audit-reports module.
2026-02-08 | Completed Physiotherapy module implementation with entity, provider, service, controller, DTOs, endpoints, validations, guards, unit tests, integration with specialized appointments, and Swagger documentation.