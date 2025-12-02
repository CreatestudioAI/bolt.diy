declare module '../build/server' {
  import type { ServerBuild } from '@remix-run/cloudflare';

  // Remix generates this module at build time; this keeps type-checking happy.
  const build: ServerBuild;
  export default build;
}
