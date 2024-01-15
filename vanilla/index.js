import { AuthClient } from "@dfinity/auth-client";
import { Actor } from "@dfinity/agent";
import { html, render } from "lit-html";
import { canisterId, createActor } from "./declarations/whoami";

// import { handleAuthenticated, renderIndex } from "./views";
// import { renderLoggedIn } from "./loggedIn";

const days = BigInt(1); // One day in nanoseconds
const hours = BigInt(24);
const nanoseconds = BigInt(3600000000000);

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
		authClient.login({ ...defaultOptions.loginOptions,
			onSuccess: async () => { handleAuthenticated(authClient); }, }); }; };

export async function handleAuthenticated(authClient) {
	const identity = (await authClient.getIdentity());
	const whoami_actor = createActor(canisterId, { agentOptions: { identity, }, });
	authClient.idleManager?.registerCallback(() => { // Invalidate identity then render login when user goes idle
		Actor.agentOf(whoami_actor)?.invalidateIdentity?.();
		renderIndex(authClient); });
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
				const response = await actor.whoami();
				(document.getElementById("whoami")).value =
					response.toString(); } 
			catch (error) { console.error(error); } };
	(document.getElementById("logout")).onclick =
		async () => {
			await authClient.logout();
			renderIndex(authClient); }; };
  
const init = async () => {
	const authClient = await AuthClient.create(defaultOptions.createOptions);
	if (await authClient.isAuthenticated()) { handleAuthenticated(authClient); }
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

init();
// style_link("assets/TEST.css")
