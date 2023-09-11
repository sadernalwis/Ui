# Bitcoin-Storage

## Setting up for local development

To get started, start a local dfx development environment in this directory with the following steps:

```bash
cd auth-client-demo/
npm install
dfx start --background --clean
dfx deps deploy
dfx deploy

#development server
npm start
```

## Pulling Internet Identity into your own project

To pull Internet Identity into your own project, you'll need to do the following:

1. Add Internet Identity to your `dfx.json` file:

```json
"internet-identity" : {
    "type": "pull",
    "id": "rdmx6-jaaaa-aaaaa-aaadq-cai"
}
```

2. Run the following commands to install the dependencies:

```bash
dfx deps pull
dfx deps init --argument '(null)' internet-identity
dfx deps deploy
```

```
git push --set-upstream origin main --force
git commit -am "changing and deleting files"
git add -A stages All (include new files, modified and deleted)
git add . stages new and modified, without deleted
git add -u stages modified and deleted, without new
```


