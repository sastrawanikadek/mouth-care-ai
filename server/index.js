require("dotenv").config();
const { ApolloServer } = require("apollo-server");
const { typeDefs } = require("./schema/TypeDefs");
const { resolvers } = require("./schema/Resolvers");

const server = new ApolloServer({ typeDefs, resolvers });
const port = process.env.PORT;

server.listen({ port }).then(({ url }) => {
  console.log(`Server starts at ${url}`);
});
