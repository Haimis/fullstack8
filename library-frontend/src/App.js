
import React, { useState, useEffect } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Notification from './components/Notification'
import { useQuery, useSubscription, useApolloClient } from '@apollo/client'
import { ALL_AUTHORS, ALL_BOOKS, BOOK_ADDED, AUTHOR_ADDED, ME } from './queries'
import Login from './components/Login'
import Recommendations from './components/Recommendations'

const App = () => {
  const [token, setToken] = useState()
  const [notification, setNotification] = useState(null)
  const [page, setPage] = useState('login')
  const user = useQuery(ME)
  const authors = useQuery(ALL_AUTHORS)
  const books = useQuery(ALL_BOOKS)
  const client = useApolloClient()

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
    setPage('login')
  }

  const updateCacheWith = (addedBook) => {
    const includedIn = (set, object) => set.map(b => b.id).includes(object.id)

    const dataInStore = client.readQuery({ query: ALL_BOOKS })
    if (!includedIn(dataInStore.allBooks, addedBook)) {
      client.writeQuery({
        query: ALL_BOOKS,
        data: { allBooks: dataInStore.allBooks.concat(addedBook) }
      })
    }
  }

  const updateAuthorCacheWith = (addedAuthor) => {
    const includedIn = (set, object) => set.map(a => a.id).includes(object.id)

    const dataInStore = client.readQuery({ query: ALL_AUTHORS })
    if (!includedIn(dataInStore.allAuthors, addedAuthor)) {
      client.writeQuery({
        query: ALL_AUTHORS,
        data: { allAuthors: dataInStore.allAuthors.concat(addedAuthor)}
      })
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('library-user-token')
    if ( token ) {
      setToken(token)
    }
  }, [])

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const addedBook = subscriptionData.data.bookAdded
      updateCacheWith(addedBook)
      window.alert(`New book ${addedBook.title} added`);
    }
  })
  
  useSubscription(AUTHOR_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const addedAuthor = subscriptionData.data.authorAdded
      updateAuthorCacheWith(addedAuthor)
    }
  })

  if(authors.loading || books.loading) {
    return (
      <div>
        loading...
      </div>
    )
  }

    
  if (token) {
    return (
      <div>
        <div>
          <button onClick={() => setPage('authors')}>authors</button>
          <button onClick={() => setPage('books')}>books</button>
          <button onClick={() => setPage('recommendations')}>recommendations</button>
          <button onClick={() => setPage('add')}>add book</button>
          <button onClick={logout} >logout</button>
        </div>

        <Notification
        notification={notification}
        />

        <Authors
          show={page === 'authors'}
          authors={authors.data.allAuthors}
          setNotification={setNotification}
        />

        <Books
          show={page === 'books'} books={books.data.allBooks}
        />

        <Recommendations
          show={page === 'recommendations'}
          books={books.data.allBooks}
          user={user.data}
        />

        <NewBook
          show={page === 'add'} setNotification={setNotification}
          setPage={setPage}
        />

      </div>
    )
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('login')}>login</button>
      </div>

      <Notification
      notification={notification}
      />

      <Authors
        show={page === 'authors'} authors={authors.data.allAuthors}
        setNotification={setNotification}
      />

      <Books
        show={page === 'books'} books={books.data.allBooks}
      />

      <Login
      show={page === 'login'} 
      setNotification={setNotification}
      setToken={setToken}
      setPage={setPage}
      />

    </div>
  )

}



export default App