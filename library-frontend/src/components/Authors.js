import React, { useState } from 'react'
import { useMutation } from '@apollo/client'
import { ALL_AUTHORS, SET_BORN } from '../queries'

const Authors = (props) => {
  const [born, setBorn] = useState('')

  const [ setBornTo ] = useMutation(SET_BORN, {
    refetchQueries: [ {query: ALL_AUTHORS} ],
    onError: (error) => {
      console.log(error)
    }
  })

  if (!props.show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()

    const name = event.target.name.value
    const num = (born === '') ? null : born
    
    setBornTo({
      variables:{name, num}
    })

    setBorn('')
  }
  
  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {props.authors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>

      <h3>Set birthyear</h3>
      <form onSubmit={submit}>

        <select name='name'>
          {props.authors.filter(a => a.born === null).map(a =>
            <option key={a.name} value={a.name} >{a.name}</option>
          )}
        </select>

        <div>
          born
          <input
            type='number'
            value={born}
            onChange={({ target }) => setBorn(Number(target.value))}
          />
        </div>
        <button type='submit'>update author</button>
      </form>
    </div>
  )
}

export default Authors
