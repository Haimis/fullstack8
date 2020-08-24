
import React, { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Notification from './components/Notification'
import { useQuery } from '@apollo/client'
import { ALL_AUTHORS, ALL_BOOKS } from './queries'
import Login from './components/Login'

const App = () => {
  const [notification, setNotification] = useState(null)
  const [page, setPage] = useState('login')
  const authors = useQuery(ALL_AUTHORS)
  const books = useQuery(ALL_BOOKS)

  if(authors.loading || books.loading) {
    return (
      <div>
        loading...
      </div>
    )
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
        <button onClick={() => setPage('login')}>login</button>
      </div>

      <Notification
      notification={notification}
      />

      <Authors
        show={page === 'authors'} authors={authors.data.allAuthors}
      />

      <Books
        show={page === 'books'} books={books.data.allBooks}
      />

      <Login
      show={page === 'login'} setNotification={setNotification}
      />

      <NewBook
        show={page === 'add'} setNotification={setNotification}
      />

    </div>
  )
}

export default App