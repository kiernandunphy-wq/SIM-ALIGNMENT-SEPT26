import { spawn } from "node:child_process";

const commands = [
  { name: "api", command: "npm", args: ["run", "api"], env: { ...process.env, PORT: "8787" } },
  { name: "vite", command: "npm", args: ["run", "vite-dev"] },
];

const children = commands.map(({ name, command, args, env }) => {
  const child = spawn(command, args, {
    shell: true,
    stdio: ["inherit", "pipe", "pipe"],
    env: env || process.env,
  });

  child.stdout.on("data", (chunk) => process.stdout.write(`[${name}] ${chunk}`));
  child.stderr.on("data", (chunk) => process.stderr.write(`[${name}] ${chunk}`));
  child.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`[${name}] exited with code ${code}`);
      shutdown();
    }
  });

  return child;
});

function shutdown() {
  for (const child of children) {
    if (!child.killed) child.kill();
  }
  process.exit();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
