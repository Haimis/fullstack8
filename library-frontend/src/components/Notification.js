import React from 'react'

const Notification = (props) => {
  if (!props.notification) {
    return null
  }
  console.log(props.notification)
  return (
    props.notification
  )
}

export default Notification