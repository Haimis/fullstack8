import React, { useState, useEffect } from 'react'

const Books = (props) => {
  const [genre, setGenre] = useState('all')
  const [genres, setGenres] = useState(['all'])

  useEffect(() => {
    props.books.map(b => {
      if (b.genres.length > 0) {
        b.genres.map(g => {
          if (!genres.includes(g)) {
            setGenres(genres.concat(g))
          }
        })
      }
    })
  })

  

  if (!props.show) {
    return null
  }

  const handleClick = (event) => {
    setGenre(event.target.value)
  }
  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {props.books.filter(b => b.genres.includes(genre) || genre === 'all').map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
        <h3>filter by genre</h3>
          {genres.map(g =>
            <button key={g} value={g} onClick={handleClick} >{g}</button>
          )}
    </div>
  )
}

export default Books