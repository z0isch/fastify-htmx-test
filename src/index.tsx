import fastify from "fastify";
import { renderToStaticMarkup } from "react-dom/server";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";

const FASTIFY_PORT = Number(process.env.FASTIFY_PORT) || 3006;

const app = fastify({
  logger: true,
}).withTypeProvider<TypeBoxTypeProvider>();

const Layout = ({ children }: { children: React.JSX.Element }) => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title></title>
    </head>
    <body>{children}</body>
    <script
      src="https://cdn.jsdelivr.net/npm/htmx.org@2.0.8/dist/htmx.min.js"
      integrity="sha384-/TgkGk7p307TH7EXJDuUlgG3Ce1UVolAOFopFekQkkXihi5u/6OCvVKyz1W+idaz"
      crossOrigin="anonymous"
    ></script>
  </html>
);

function renderFullPage(body: React.JSX.Element): string {
  return "<!DOCTYPE html>" + renderToStaticMarkup(<Layout>{body}</Layout>);
}

const ServerTime = () => {
  return <>{new Date().toISOString()}</>;
};

app.get(
  "/",
  {
    schema: {
      headers: Type.Object({
        "hx-request": Type.Optional(Type.Boolean()),
      }),
    },
  },
  (req, reply) => {
    reply.type("text/html; charset=utf-8");
    reply.send(
      req.headers["hx-request"]
        ? renderToStaticMarkup(<ServerTime />)
        : renderFullPage(
            <>
              Server time:{" "}
              <span hx-get="/" hx-trigger="every 1s">
                <ServerTime />
              </span>
            </>
          )
    );
  }
);

app.listen({ port: FASTIFY_PORT });
