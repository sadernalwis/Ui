import { AuthClient } from "@dfinity/auth-client";
import { Actor, AnonymousIdentity } from "@dfinity/agent";
import { html, render } from "lit-html";
import { canisterId, createActor } from "./declarations/whoami";

// import { handleAuthenticated, renderIndex } from "./views";
// import { renderLoggedIn } from "./loggedIn";
const days = BigInt(1); // One day in nanoseconds
const hours = BigInt(24);
const nanoseconds = BigInt(3600000000000);
const five_seconds = BigInt(5e+9);

class Canistro{

	static options = { 	create: { idleOptions: { disableIdle: true /* Set to true if you do not want idle functionality */ , }, },
						login1 : { identityProvider: process.env.DFX_NETWORK === "ic" ? "https://identity.ic0.app/#authorize" : `http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943/`, maxTimeToLive: days * hours * nanoseconds /* Maximum authorization expiration is 8 days */ , } , 
						login : { identityProvider: process.env.DFX_NETWORK === "ic" ? "https://identity.ic0.app/#authorize" : `http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943/`, maxTimeToLive: five_seconds /* Maximum authorization expiration is 8 days */ , } , 
					};

	constructor() {
		this.canisters = {} 
		this.actors = {} 
		this.load_canisters()
	}

	async client(){
		this.auth_client = this.auth_client || await AuthClient.create(Canistro.options.create)
		return this.auth_client
	}
	async load_canisters(){
		for (const key in process.env){ 
			if(key.startsWith("CANISTER_ID_")){
				const cid = process.env[key]
				if (cid !== process.env.CANISTER_ID){
					const ckey = key.replace("CANISTER_ID_",'').toLowerCase()
					this.canisters[ckey] = cid  } } } }

	async actor(caller_ident, canister_name){
		if (canister_name in this.actors){ 
			let [actor_ident, actor] = this.actors[canister_name]
			if (!caller_ident || actor_ident.toString() === caller_ident.toString()){ return actor }}
		const { canisterId, createActor} = await import(`/${"declarations"}/${canister_name}`/* @vite-ignore */)
		const client = await this.client()
		const identity = await client.getIdentity()
		const authenticated = await client.isAuthenticated()
		const actor = createActor(canisterId, { agentOptions: { identity, }, })
		this.actors[canister_name] = [identity, actor];
		return actor
	} 

	async login(){
		let that = this;
		const client = await this.client()
		client.login({ ...Canistro.options.login,
			onSuccess: async () => { 
				console.log("Login Successful")
				handleAuthenticated(client);
				// that.fire('login', 0, 	 that);
				client.idleManager?.registerCallback(() => { // Invalidate identity then render login when user goes idle
					for (const actor_name in that.actors){ 
						const actor =  that.actors[actor_name]
						console.log(`invalidating canister ${actor_name}!`)
						Actor.agentOf(actor)?.invalidateIdentity?.(); }}); },
			onError  : async () => { 
				console.log("Login Error")
				that.fire('login', 255, that); }, 
		})
	}						

	async logout(){
		const client = await this.client()
		await client.logout();
	}
	async is_authenitcated(){
		const client = await this.client()
		return await client.isAuthenticated()
	}

	async identity(){
		const client = await this.client()
		return await client.getIdentity()
	}
			
	async call(canister_name, method){
		const actor = await this.actor(null ,canister_name)
		return await actor[method]();
		// index.js:155 AgentHTTPResponseError: Server returned an error:
		// Code: 400 (Bad Request)
		// Body: Specified sender delegation has expired:
	}

	async invalidate(caller_ident, canister_name){
		const canister_actor = await this.actor(caller_ident, canister_name)
		Actor.agentOf(canister_actor)?.invalidateIdentity?.();
	}
}
export const defaultOptions = {
	createOptions: {
		idleOptions: { disableIdle: true, }, }, /* Set to true if you do not want idle functionality */
		loginOptions: { identityProvider: process.env.DFX_NETWORK === "ic" ? "https://identity.ic0.app/#authorize" : `http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943/`, maxTimeToLive: days * hours * nanoseconds, /* Maximum authorization expiration is 8 days */ }, };

const content = html`<div class="container">
	<h1 class="delta">Internet Identity Client</h1>
	<h2>You are not authenticated</h2>
	<p>To log in, click this button!</p>
	<button type="button" id="loginButton">Log in</button>
</div>`;

export const renderIndex = async ( client, statusMessage ) => {
	const authClient = client ?? (await AuthClient.create(defaultOptions.createOptions));
	const pageContent = document.getElementById("pageContent");
	if (pageContent) { render(content, pageContent); }
	const status = document.getElementById("status");
	const statusContent = document.getElementById("content");
	if (statusMessage && statusContent) {
		render(statusMessage, statusContent);
		status?.classList.remove("hidden"); } 
	else { status?.classList.add("hidden"); }

	const loginButton = document.getElementById( "loginButton" );
	loginButton.onclick = () => {
		canistro.login()
		// authClient.login({ ...defaultOptions.loginOptions, onSuccess: async () => { handleAuthenticated(authClient); }, }); 
		}; };

export async function handleAuthenticated(authClient) {
	// const identity = (await authClient.getIdentity());
	const whoami_actor = await canistro.actor(null, "whoami")//createActor(canisterId, { agentOptions: { identity, }, });
	// authClient.idleManager?.registerCallback(() => { // Invalidate identity then render login when user goes idle
	// 	Actor.agentOf(whoami_actor)?.invalidateIdentity?.();
	// 	renderIndex(authClient); });
	renderLoggedIn(whoami_actor, authClient); }
		

const logged_content = () => html`<div class="container">
	<style>
	  #whoami {
		border: 1px solid #1a1a1a;
		margin-bottom: 1rem;
	  }
	</style>
	<h1>Internet Identity Client</h1>
	<h2>You are authenticated!</h2>
	<p>To see how a canister views you, click this button!</p>
	<button type="button" id="whoamiButton" class="primary">Who am I?</button>
	<input type="text" readonly id="whoami" placeholder="your Identity" />
	<button id="logout">log out</button>
  </div>`;
  
export const renderLoggedIn = ( actor, authClient) => {
	render(logged_content(), document.getElementById("pageContent"));
	(document.getElementById("whoamiButton")).onclick =
		async () => {
			try {
				const response = await canistro.call("whoami", "whoami")//await actor.whoami();
				document.getElementById("whoami").value = response.toString(); 
			} 
			catch (error) { console.error(error); } };
	(document.getElementById("logout")).onclick =
		async () => {
			// await authClient.logout();
			await canistro.logout()
			renderIndex(authClient); }; };
  
const init = async () => {
	// const authClient = await AuthClient.create(defaultOptions.createOptions);
	// if (await authClient.isAuthenticated()) { 
	// 	console.log("Already Authenticated!")
	// 	handleAuthenticated(authClient); }
	// else { console.log("Not Authenticated!")}
	renderIndex();
	setupToast(); };

async function setupToast() {
	const status = document.getElementById("status");
	const closeButton = status?.querySelector("button");
	closeButton?.addEventListener("click", () => { status?.classList.add("hidden"); }); }

function style_link(address) {
	let style_link = document.createElement('link');
	style_link.setAttribute('rel', 'stylesheet');
	style_link.setAttribute('href', address);
	document.head.append(style_link); // append stylesheet to Shadow DOM
}

window.canistro = new Canistro()
init();
// style_link("assets/TEST.css")
