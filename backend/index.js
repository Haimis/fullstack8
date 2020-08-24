require('dotenv').config()
const { ApolloServer, UserInputError, gql, AuthenticationError } = require('apollo-server')
const jwt = require('jsonwebtoken')


const mongoose = require('mongoose')
const Author = require('./models/author')
const Book = require('./models/book')
const author = require('./models/author')

mongoose.set('useFindAndModify', false)

const MONGODB_URI = `mongodb+srv://fullstack:${process.env.MONGO_PW}@cluster0-so2kc.mongodb.net/library?retryWrites=true&w=majority`
const JWT_SECRET = process.env.JWT_SEC

mongoose.set('useCreateIndex', true)

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((e) => {
    console.log(e.message)
  })

const typeDefs = gql`
  type Book {
      title: String!
      published: Int
      author: Author!
      id: ID!
      genres: [String!]
  }
  type Author {
      name: String!
      id: ID!
      born: Int
      bookCount: Int!
  }
  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
  }

  type Mutation {
    addBook(
        title: String!
        author: String!
        published: Int
        genres: [String!]
    ): Book
    editAuthor(
        name: String!
        setBornTo: Int!
    ): Author
  }
`

const resolvers = {
  Query: {
    bookCount: () => Book.countDocuments(),
    authorCount: () => Author.countDocuments(),
    allBooks: (root, args) => {
        let booksToReturn = Book.find({})
        if (args.author) {
            booksToReturn = booksToReturn.filter(b => b.author === args.author)
        }
        if (args.genre) {
            booksToReturn = booksToReturn.filter(b => b.genres.includes(args.genre))
        }
        return booksToReturn
    },
    allAuthors: () => Author.find({})
  },
  Author: {
      bookCount: async (root) =>  await Book.find({ author: root.id }).countDocuments()
  },
  Mutation: {
      addBook: async (root, args) => {
        let author = await Author.findOne({ name: args.author })
        if (!author) {
          author = new Author( { name: args.author })
          try {
            await author.save()
          } catch (e) {
            throw new UserInputError(e.message)
          }
        }

        const book = new Book({ 
          title: args.title, 
          author: author, 
          published: args.published, 
          genres: args.genres 
        })

        try {
          await book.save()
        } catch (e) {
          throw new UserInputError(e.message)
        }

        
        return book
      },
      editAuthor: async (root, args) => {
          const author = await Author.findOne({ name: args.name })
          author.born = args.setBornTo
          try {
            await author.save()
          } catch (e) {
            throw new UserInputError(e.message)
          }
      }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    if (0 === 0) {
      return 'muista tehdä autentikointi'
    }
  }
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})