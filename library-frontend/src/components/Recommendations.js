import React from 'react'

const Recommendations = (props) => {

  if (!props.show) {
    return null
  }

  console.log(props.user.me.favoriteGenre)

  return (
    <div>
      <h2>recommendations</h2>
      books in your favorite genre <b>{props.user.me.favoriteGenre}</b>

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
          {props.books.filter(b => b.genres.includes(props.user.me.favoriteGenre)).map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
  
  export default Recommendations