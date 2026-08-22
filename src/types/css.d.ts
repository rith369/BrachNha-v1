// Next declares `*.module.css` (see node_modules/next/types/global.d.ts) but not
// plain `*.css`, so the side-effect import of globals.css in app/layout.tsx has
// no declaration. TypeScript 5.9 ignores that; newer versions report it as
// ts(2882). package.json pins "typescript": "^5", and Vercel installs fresh on
// every deploy, so this keeps a future 5.x bump from failing `next build`.
declare module "*.css";
