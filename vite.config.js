import path from "path";
import { defineConfig } from "vite";
import EnvironmentPlugin from "vite-plugin-environment";
import dotenv from "dotenv";
dotenv.config();

const isDevelopment = process.env.NODE_ENV !== "production";
const network = process.env.DFX_NETWORK || (process.env.NODE_ENV === "production" ? "ic" : "local");
function initCanisterEnv() {
	let localCanisters, prodCanisters;
	try 			{ localCanisters = require( path.resolve(".dfx", "local", "canister_ids.json") ); } 
	catch (error) 	{ console.log( "No local canister_ids.json found. Continuing production", path.resolve("../.dfx", "local", "canister_ids.json") ); }
	try 			{ prodCanisters = require(path.resolve("canister_ids.json")); } 
	catch (error) 	{ console.log( "No production canister_ids.json found. Continuing with local" ); }
	const canisterConfig = network === "local" ? localCanisters : prodCanisters;
	return Object.entries(canisterConfig).reduce((prev, current) => {
		const [canisterName, canisterDetails] = current;
		prev[canisterName.toUpperCase() + "_CANISTER_ID"] =
			canisterDetails[network];
		return prev;
	}, {});
}
const canisterEnvVariables = initCanisterEnv();

let environment = {is_development : isDevelopment, mode: process.env.NODE_ENV}
environment = Object.keys(process.env).reduce((accumulator, key) => {
	const value = process.env[key];
	if (key.includes("CANISTER") || key.includes("DFX")){ accumulator[key] = value; }
	return accumulator; }, environment);
	
export default defineConfig({
	root: path.resolve(__dirname, "src", "frontend"),
	build: {
		outDir: path.resolve(__dirname, "dist"),
		emptyOutDir: true,
	},
	define: {
		global: "window",
		'process.env.NODE_ENV': JSON.stringify(canisterEnvVariables),
		"process.env.__CANISTERS__": JSON.stringify(environment)
	},
	server: {
		proxy: { "/api": { target: "http://localhost:4943", changeOrigin: true, }, },
	},
	plugins: [
		EnvironmentPlugin("all", { prefix: "CANISTER_" }),
		EnvironmentPlugin("all", { prefix: "DFX_" }),
		EnvironmentPlugin({ BACKEND_CANISTER_ID: "" }),
	],
});
