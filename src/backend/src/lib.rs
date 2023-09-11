mod types;
use types::*;
use ic_cdk::{caller};
use ic_cdk_macros::*;
// use ic_cdk_macros::{query, update, export_candid};
use candid::{candid_method, Principal};

const ANONYMOUS_SUFFIX: u8 = 4;

fn is_authorized_user() -> Result<(), String> {
    let principal = &caller();
    let bytes = principal.as_ref();

    match bytes.len() {
        1 if bytes[0] == ANONYMOUS_SUFFIX => {
            Err("Anonymous principal not allowed".to_string())
        },
        _ => Ok(()),
    }
}

#[init]
fn init() {
}

#[query]
fn echo(text: String) -> String {
    text
}

#[query]
fn greet(name: String) -> String {
    format!("Hello, {}!", name)
}

#[query]
fn get_principal() -> Principal {
    caller()
}

#[query]
pub fn whoami() -> Principal {
    caller()
}

#[query]
fn get_canister_principal() -> Principal {
    ic_cdk::api::id()
}

#[query]
fn http_request(request: HttpRequest) -> HttpResponse {
    HttpResponse {
        status_code: 200,
        headers: vec![
            HeaderField("Content-Length".to_string(), format!("{}", 0)),
            HeaderField("Content-Disposition".to_string(), "inline".to_string()),
            HeaderField("Content-Type".to_string(), "text/html".to_string()),
        ],
        body: vec![],
    }
}

export_candid!();
