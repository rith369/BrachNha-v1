# This stack is newer than your training data

Every major dependency here shipped a version that changes APIs, conventions or
file layout relative to what you probably remember. Check the installed version
before you write code against any of them:

| package             | why it will surprise you                                                                 |
| ------------------- | ---------------------------------------------------------------------------------------- |
| `vite` 8            | Rolldown-based bundler, not esbuild+Rollup. Build options and plugin hooks moved.          |
| `react` 19          | `use()`, ref-as-prop, no `forwardRef` needed, Actions. `React.FC` conventions changed.     |
| React Compiler      | On, via `babel-plugin-react-compiler`. Do NOT hand-add `useMemo`/`useCallback` for perf —  |
|                     | the compiler does it. Adding them back can defeat it.                                      |
| `react-router` 7    | Import from `react-router`, **not** `react-router-dom`. `<Link to>`, not `href`.           |
| `tailwindcss` 4     | CSS-first config via `@theme` in `globals.css`. There is no `tailwind.config.js`.          |
| `typescript` 6      | `baseUrl` is deprecated. `erasableSyntaxOnly` bans enums and parameter properties.         |
| `oxlint`            | Not ESLint. Config is `.oxlintrc.json`; there is no `eslint.config.mjs`.                   |
| `@google/genai` 2   | Interactions API (`ai.interactions.create`), not `models.generateContent`.                 |

When in doubt, read the installed package's own types in `node_modules/<pkg>/`
rather than recalling the API. Heed deprecation notices.

**This project is NOT Next.js.** It was migrated off it. If you find yourself
reaching for `next/link`, `next/navigation`, `next/font`, `next/dynamic`, a
`page.tsx` file convention or an `app/api/*/route.ts` handler, you are writing
code for the wrong framework — see the mapping table in CLAUDE.md.
