import "zx/globals";

echo("Building canisters");
await $`dfx build --network ic`;

echo("Copying to dist");
await $`mkdir -p dist`;
await $`cp .dfx/ic/canisters/backend/backend.wasm dist/backend.wasm`;
await $`cp .dfx/ic/canisters/backend/backend.did dist/backend.did`;

await $`cp .dfx/ic/canisters/auth_client_demo_assets/assetstorage.wasm.gz dist/assetstorage.wasm.gz`;
await $`cp .dfx/ic/canisters/auth_client_demo_assets/assetstorage.did dist/assetstorage.did`;

let pathPrefix =
  "https://github.com/krpeacock/auth-client-demo/releases/latest/download/";



echo("Done");
