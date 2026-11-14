// packages/contracts is compiled against the web's zod and the app's zod; both lockfiles must pin the same version.
import { readFileSync } from "node:fs";

const zodVersion = (lockfile) =>
  JSON.parse(readFileSync(new URL(`../${lockfile}`, import.meta.url), "utf8")).packages["node_modules/zod"]?.version;

const web = zodVersion("package-lock.json");
const mobile = zodVersion("mobile/package-lock.json");

if (!web || web !== mobile) {
  console.error(`zod versions differ: package-lock.json ${web}, mobile/package-lock.json ${mobile}. Pin both to the same version.`);
  process.exit(1);
}
console.log(`zod ${web} in both lockfiles`);
