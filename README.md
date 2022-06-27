# October Test

The main goal of this API is to retrieve phone number based on given company `name`, and possibly on given `siren`.

## How to make it run ?

Several commands could be used

- `npm run build` to build the project once.
- `npm run build:watch` to build in watching mode.
- `npm run dev` to both build and start the server. It reiterates if changes are detected.
- `npm run start` to start the server from built `/dist` folder.

## How is it structured/architectured ?

In the `/src` folder, there are several subfolders

- `/handlers` containing used middlewares/handlers, like `cache` and `error` handlers.
- `/helpers` containing helpul functions/wrappers or types, like for `route` setup or external `api` calls.
- `/routes` containing one route (for now), the `/phone` folder, divided in 4 files
  - `phone.route.ts` where is handled the HTTP route setup.
  - `phone.schema.ts` where is represented the input validation schema.
  - `phone.service.ts` where is implemented the full business logic to retrieve data.
  - `phone.types.ts` where are listed useful types for external API.
- `config.ts` file, that play the role of .env file.
- `index.ts` main file, where all express server is setup.

Several `index.ts` files present in some folders are used to export things in the same set.

## On what is it based ?

My work is based on two external API

- [`Government Sirene API`](https://api.gouv.fr/documentation/sirene_v3), a public API that references a huge amount of information about companies, like siren, activity periods, etc. This is a fiable API because provided by the government itself (by INSEE).
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
Here are some request tests from Insomnia tool, make on the only one GET `/phone` route.

![experdeco](https://user-images.githubusercontent.com/30266205/175837409-c343f680-e0dc-489d-b1d9-5f6bc405f727.png)
![jardillier](https://user-images.githubusercontent.com/30266205/175837396-0f1826ed-781d-4e53-8458-760f2e99f27f.png)
![paris_atelier](https://user-images.githubusercontent.com/30266205/175837400-0eb0df82-19bb-4db9-9f6e-9bd6c6b5c5e7.png)
![hotel](https://user-images.githubusercontent.com/30266205/175837404-ec390b1f-a520-4661-8e76-12e8d91089c1.png)

## Other interesting things

I've included a cache system to avoid sending several identical requests.
We can easily see that process time is highly reduced with the mechanism.

![cache](https://user-images.githubusercontent.com/30266205/175837559-e6f1be9e-5c4d-4f52-bffd-a5486740041e.png)

## Author

**William CHAZOT (Nonudian)**
