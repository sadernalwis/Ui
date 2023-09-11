#!/usr/bin/env bash
# https://daviddalbusco.com/blog/automatic-candid-generation-in-rust-exploring-the-ic-cdk-v0-10-0-update/
function generate_did() { 
    local canister=$1
    canister_root="src/$canister"
    cargo build --manifest-path="$canister_root/Cargo.toml" --target wasm32-unknown-unknown --release --package "$canister" --features "ic-cdk/wasi"
    # Installation https://docs.wasmtime.dev/cli-install.html
    wasmtime "target/wasm32-unknown-unknown/release/$canister.wasm" > "$canister_root/$canister.did"
}
# The list of canisters of your project #console,observatory,mission_control,satellite
CANISTERS=backend
for canister in $(echo $CANISTERS | sed "s/,/ /g")
do
  generate_did "$canister"
done
