# Basma.com code challenge
This is our submission for the Basma code challenge.

## Features
- Typescript for type-checking
- Backend using Express.js/ApolloServer (GraphQL)
- Backend serves the react frontend
- React.js frontend with Material UI and Redux
- Rate limiting instead of captcha
- Mailgun for email verification
- Cronjob configured automatically when the application is started
- Infrastructure As Code using AWS CDK to bootstrap all the required services
- Backend search processing and filtering

## Deploying the application on AWS

We have defined the Infrastructure using code in [./infrastructure](./infrastructure), and we
can easily deploy it using AWS CDK. Assuming you have CDK installed and configured on your machine,
run the following:

```sh
cd infrastructure
# if you have not bootstrapped AWS CDK into your account:
cdk bootstrap
# deploy the code
cdk deploy
```

## Running the application locally

Running the application can be done by installing the dependencies, setting the proper environment
variables, and building it.

### Install dependencies

Use `npm` or `yarn` to install the dependencies. We will proceed with using npm as it is more
accessible. Run the following to install the dependencies:

`npm install`

### Set the environment variables

On a *nix system, navigate to `src/backend` and copy `.env.devel` to `.env` and
insert the proper variables (database credentials, mailgun keys, etc.)  

```sh
# copy the file
cp -i src/backend/.env.devel src/backend/.env
# edit the file
vim src/backend/.env
```

After setting the proper environment variabls in `src/backend/.env`, run the following:

```sh
to import the environment variables to your current shell.
. ./src/backend/.env
```

### Run

Finally, to setup the cronjob, build the frontend and backend, and start the server, run the following:

`npm start`


