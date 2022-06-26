# October Test

The main goal of this API is to retrieve phone number based on given company `name`, and possibly on given `siren`.

## How to make it run ?

Several commands could be used

- `npm run build` to build the project once.
- `npm run build:watch` to build in watching mode.
- `npm run dev` to both build and start the server. It reiterates if changes are detected.
- `npm run start` to start the server from built `/dist` folder.

## On what is it based ?

My work is based on two external API

- [`Government Sirene API`](https://api.gouv.fr/documentation/sirene_v3), a public API that reference a huge amount of information about companies, like siren, activity periods, etc. This is a fiable API because provided by the government itself (by INSEE).
- [`IDAIA Group API Data Store`](https://api.api-datastore.com/doc/index.html), a buyable API solution, but providing 100 free requests as demo version. Like the above API, it provides same but additional information, like phone numbers (mobile or landline/work phone).

## How it works ?

As we know, the user could be wrong when sending _uncomplete_ `name` or _bad associated_ `siren`. In order to reduce these bad cases, the Sirene API is a good source to check the truthfulness of data sent by the user. When we are sure the company exists, we can obtain the _real_/_verified_ `siren`, and then call the DataStore API to retrieve `phone`.

The final result is formatted as `{ data: +33000000000 }`, but

- If the input data (`name` and `siren`) doesn't allow to get `company` from Sirene API
- If the found `siren` from Sirene API is not referenced in DataStore API
- If no `phone` values are found for a `company` in DataStore API

The date will take the form `{ data: 'No phone found for this company.' }`.

## How to test it ?

Both those API need a token to be generated/provided to be able to test them. And for both, an account is required.

Here are some request test from Insomnia tool, make on the only one GET `/phone` route.
