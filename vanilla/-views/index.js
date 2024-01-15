import { Actor, Identity } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { html, render } from "lit-html";
import { canisterId, createActor } from "../declarations/whoami";
import { renderLoggedIn } from "./loggedIn";
import { defaultOptions } from "..";

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
