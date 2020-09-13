const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const schema = require("./schema.js");
const cors = require("cors");

const app = express();

app.use(cors());

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

// Listening on port
const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Server is online on port ${port}...`);
});
