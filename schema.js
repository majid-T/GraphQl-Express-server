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

const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addContact: {
      type: ContactType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        lastName: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: GraphQLString },
        cellNo: { type: GraphQLInt },
        homeNo: { type: GraphQLInt },
        workNo: { type: GraphQLInt },
      },
      async resolve(parentValue, args) {
        const connection = await loadMongoDbConnection();

        const result = await connection.insertOne({
          name: args.name,
          lastName: args.lastName,
          email: args.email,
          cellNo: args.cellNo,
          homeNo: args.homeNo,
          workNo: args.workNo,
        });

        return result.ops[0];
      },
    },
    deleteContact: {
      type: ContactType,
      args: {
        _id: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(parentValue, args) {
        const connection = await loadMongoDbConnection();

        const result = await connection.deleteOne({
          _id: new mongoDb.ObjectID(args._id),
        });

        // [TBD : return proper value]
        return result;
      },
    },
    editContact: {
      type: ContactType,
      args: {
        _id: { type: new GraphQLNonNull(GraphQLString) },
        name: { type: GraphQLString },
        lastName: { type: GraphQLString },
        email: { type: GraphQLString },
        cellNo: { type: GraphQLInt },
        homeNo: { type: GraphQLInt },
        workNo: { type: GraphQLInt },
      },
      async resolve(parentValue, args) {
        const connection = await loadMongoDbConnection();

        const targetContact = await connection.findOne({
          _id: new mongoDb.ObjectID(args._id),
        });

        targetContact.name = args.name || targetContact.name;
        targetContact.lastName = args.lastName || targetContact.lastName;
        targetContact.email = args.email || targetContact.email;
        targetContact.cellNo = args.cellNo || targetContact.cellNo;
        targetContact.homeNo = args.homeNo || targetContact.homeNo;
        targetContact.workNo = args.workNo || targetContact.workNo;

        const result = await connection.updateOne(
          {
            _id: new mongoDb.ObjectID(args._id),
          },
          { $set: targetContact }
        );

        const modContact = await connection.findOne({
          _id: new mongoDb.ObjectID(args._id),
        });

        return modContact;
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
  mutation,
});
