import fastify from "fastify";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import htm from "htm";
import vhtml from "vhtml";

const FASTIFY_PORT = Number(process.env.FASTIFY_PORT) || 3006;

const app = fastify({
  logger: true,
}).withTypeProvider<TypeBoxTypeProvider>();

const html = (strings: TemplateStringsArray, ...values: any[]): string => {
  const r = htm.bind(vhtml)(strings, ...values);
  return Array.isArray(r) ? r.join("") : r;
};

const Layout = ({ children }: { children: () => string }) =>
  html`<html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title></title>
    </head>
    <body>
      ${children}
    </body>
    <script
      src="https://cdn.jsdelivr.net/npm/htmx.org@2.0.8/dist/htmx.min.js"
      integrity="sha384-/TgkGk7p307TH7EXJDuUlgG3Ce1UVolAOFopFekQkkXihi5u/6OCvVKyz1W+idaz"
      crossorigin="anonymous"
    ></script>
  </html>`;

const ServerTime = () => html`<span>${new Date().toISOString()}</span>`;

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
    reply.type("text/html");
    return req.headers["hx-request"]
      ? html`<${ServerTime} />`
      : html`<${Layout}><span hx-get="/" hx-trigger="every 1s"><${ServerTime} /></span></${Layout}>`;
  }
);

app.listen({ port: FASTIFY_PORT });
