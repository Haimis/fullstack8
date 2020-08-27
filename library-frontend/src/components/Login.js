import React, { useState } from 'react'
import { useMutation } from '@apollo/client'

import { CREATE_USER, LOGIN, ME } from '../queries'

const Login = (props) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [newUsername, setNewUsername] = useState('')
  const [favoriteGenre, setFavoriteGenre] = useState('')

  const [ createNewUser ] = useMutation(CREATE_USER, {
    onError: (error) => {
        props.setNotification(error.message)
        setTimeout(() => {
          props.setNotification(null)
        }, 5000)
      },
    onCompleted: () => {
      props.setNotification(`new user created`)
      setTimeout(() => {
        props.setNotification(null)
      }, 5000)
    }
  })

  const [ logUserIn ] = useMutation(LOGIN, {
    onError: (error) => {
        props.setNotification(error.message)
        setTimeout(() => {
          props.setNotification(null)
        }, 5000)
      },
    onCompleted: (response) => {
      props.setNotification(`succesfully logged in`)
      props.setToken(response.login.value)
      props.setPage('authors')
      setTimeout(() => {
        props.setNotification(null)
      }, 5000)
    }
  })

  if (!props.show) {
    return null
  }

  const login = async (event) => {
    event.preventDefault()

    logUserIn({
        variables:{username, password}
    })

    setUsername('')
    setPassword('')
    setNewUsername('')
    setFavoriteGenre('')
  }

  const createUser = async (event) => {
    event.preventDefault()
    
    createNewUser({
        variables:{newUsername, favoriteGenre}
    })

    setUsername('')
    setPassword('')
    setNewUsername('')
    setFavoriteGenre('')
  }

  return (
    <div>
        <h2>login or create user</h2>
        <form onSubmit={login}>
        <h3>login</h3>
        <div>
          username
          <input
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password
          <input
            type="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type='submit'>login</button>
      </form>
        <form onSubmit={createUser}>
        <h3>create new user</h3>
        <div>
          username
          <input
            value={newUsername}
            onChange={({ target }) => setNewUsername(target.value)}
          />
        </div>
        <div>
          favorite genre
          <input
            value={favoriteGenre}
            onChange={({ target }) => setFavoriteGenre(target.value)}
          />
        </div>
        <button type='submit'>create user</button>
        </form>
    </div>
  )
}

export default Login