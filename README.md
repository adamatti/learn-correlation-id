Pet project to show correlationIds / traceIds for observability.

It uses [AsyncLocalStorage](https://nodejs.org/api/async_context.html#class-asynclocalstorage) to hold context ids, so it just need to change the borders to propagate it.

E.g. HTTP server and SQS handler receive the IDs - or create one if not provided, and `sendSQSMessage` / `httpCall` get it from context and send to nested calls.

# How to play with it

1. Start localstack: `docker compose up -d`
2. Create a test queue: `dotenv -e .env -- pnpm dlx esno src/setup.ts`. It could be done with terraform or manually
3. Run the app: `dotenv -e .env -- pnpm dlx esno src/index.ts`
4. Do http calls using [httpie](https://httpie.io/) (or curl/http get), e.g.

```
http GET ":3000/abc
```

or providing the ids:

```
http GET ":3000/abc" "x-originator-request-id":"test" "x-request-id":"test2"
```

It also accepts nested calls (doing it recursive for this sample). We can use the param `subCalls` with a queue and adding `s` for sqs and `h` for http. E.g.

```
http GET ":3000/abc?subCalls=sh"
```

It will do one sqs sub call, then a http one.

With that you can search in the logs using the `OriginatorRequestId`.


