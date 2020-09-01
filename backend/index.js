require('dotenv').config()
const { ApolloServer, UserInputError, gql, AuthenticationError } = require('apollo-server')
const jwt = require('jsonwebtoken')


const mongoose = require('mongoose')
const { PubSub } = require('apollo-server')
const pubsub = new PubSub()
const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')

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
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }
  type Token {
    value: String!
  }
  type Query {
    me: User
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
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
  }

  type Subscription {
    bookAdded: Book!
  }
`

const resolvers = {
  Query: {
    me: (root, args, context) => {
      return context.currentUser
    },
    bookCount: () => Book.countDocuments(),
    authorCount: () => Author.countDocuments(),
    allBooks: async (root, args) => {
        let booksToReturn = await Book.find({})
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
    bookCount: async (root) => await Book.find({ author: root.id }).countDocuments()
  },
  Book: {
    author: async (root) => {
      const thisAuthor = await Author.findOne({ _id: root.author })
      return {
        id: root.author,
        name: thisAuthor.name,
        born: thisAuthor.born,
        bookCount: thisAuthor.bookCount
      }
    } 
  },
  Mutation: {
      addBook: async (root, args, context) => {
        const currentUser = context.currentUser

        if (!currentUser) {
          throw new AuthenticationError("not authenticated")
        }

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

        pubsub.publish('BOOK_ADDED', { bookAdded: book })

        return book
      },
      editAuthor: async (root, args, context) => {
        const currentUser = context.currentUser

        if (!currentUser) {
          throw new AuthenticationError("not authenticated")
        }


        const author = await Author.findOne({ name: args.name })
        author.born = args.setBornTo
        try {
          await author.save()
        } catch (e) {
          throw new UserInputError(e.message)
        }
      },
      createUser: async (root, args) => {
        const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })
        try {
          await user.save()
        } catch (e) {
          throw new UserInputError(e.message)
        }
        return user
      },
      login: async (root, args) => {
        const user = await User.findOne({ username: args.username })
        if ( !user || args.password !== 'passu' ) {
          throw new UserInputError("wrong username or password")
        }
        const userForToken = {
          username: user.username,
          id: user._id
        }

        return { value: jwt.sign(userForToken, JWT_SECRET) }
      }
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      const currentUser = await User.findById(decodedToken.id)
      return {
        currentUser
      }
    }
  }
})

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`Server ready at ${url}`)
  console.log(`Subscription ready at ${subscriptionsUrl}`)
})