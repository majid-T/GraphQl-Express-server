const mongoDb = require("mongodb");
const config = require("config");

const dbUri = config.get("mongoURI");

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull,
} = require("graphql");

const CustomerType = new GraphQLObjectType({
  name: "Customer",
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    age: { type: GraphQLInt },
  }),
});
const ContactType = new GraphQLObjectType({
  name: "Contact",
  fields: () => ({
    _id: { type: GraphQLString },
    name: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    cellNo: { type: GraphQLInt },
    homeNo: { type: GraphQLInt },
    workNo: { type: GraphQLInt },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    contact: {
      type: ContactType,
      args: {
        _id: { type: GraphQLString },
      },
      async resolve(parentValue, args) {
        const connection = await loadMongoDbConnection();

        const result = await connection.findOne({
          _id: new mongoDb.ObjectID(args._id),
        });

        return result;
      },
    },
    contacts: {
      type: new GraphQLList(ContactType),
      async resolve(parentValue) {
        const connection = await loadMongoDbConnection();

        const result = await connection.find({}).toArray();
        return result;
      },
    },
  },
});

//Geting Our MongoDb -- custom function
async function loadMongoDbConnection() {
  const client = await mongoDb.MongoClient.connect(dbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  return client.db("devSamples").collection("contacts");
}

module.exports = new GraphQLSchema({
  query: RootQuery,
});
