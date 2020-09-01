import { gql } from '@apollo/client'

export const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      bookCount
    }
  }
`

export const ALL_BOOKS = gql`
  query {
    allBooks {
      title
      author {
        name
      }
      published
      genres
    }
  }
`


export const ME = gql`
query {
  me {
    username
    favoriteGenre
  }
}
`
export const CREATE_BOOK = gql`
  mutation createBook($title: String!, $author: String!, $num: Int, $genres: [String!]) {
    addBook (
      title: $title
      author: $author
      published: $num
    	genres: $genres
  	){
    id
   }
  }
`

export const SET_BORN = gql`
  mutation setBorn($name: String!, $num: Int!) {
    editAuthor (
      name: $name
      setBornTo: $num
  	){
    id
   }
  }
`
export const CREATE_USER = gql`
mutation createUser($newUsername: String!, $favoriteGenre: String!) {
  createUser (
    username: $newUsername
    favoriteGenre: $favoriteGenre
  ){username}
}
`
export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login (
      username: $username
      password: $password
  	){
    value
   }
  }
`

export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      title
      id
    }
  }
`

export const AUTHOR_ADDED= gql`
  subscription {
    authorAdded {
      id
    }
  }
`
