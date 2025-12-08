import { bench, run } from "mitata";

const BASE_URL = "http://localhost:3000/api";

async function main() {
  console.log("Checking connectivity...");
  try {
    const jstackRes = await fetch(`${BASE_URL}/workspace/ping`);
    const elysiaRes = await fetch(`${BASE_URL}/elysia-health`);
    
    if (!jstackRes.ok) throw new Error(`JStack health check failed: ${jstackRes.status}`);
    if (!elysiaRes.ok) throw new Error(`Elysia health check failed: ${elysiaRes.status}`);
    
    console.log("Both endpoints are reachable. Starting benchmark...");
  } catch (e) {
    console.error("Server must be running on localhost:3000 for benchmark.");
    console.error(e);
    process.exit(1);
  }

  bench("JStack (Hono + JStack overhead)", async () => {
    await fetch(`${BASE_URL}/workspace/ping`);
  });

  bench("Elysia (Native)", async () => {
    await fetch(`${BASE_URL}/elysia-health`);
  });

  await run();
}

main().catch(console.error);
