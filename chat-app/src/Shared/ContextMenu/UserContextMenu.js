import React, { useContext } from 'react'
import GenericContextMenu from './GenericContextMenu'
import { Modal, ModalAction, ModalService, UserContext } from '../../App'
import { ChannelsContext, ClientContext, FriendsContext } from '../../Chat'
import { useNavigate } from 'react-router'

export default function UserContextMenu({ user, context }) {
  const friends = useContext(FriendsContext)
  const client = useContext(ClientContext)
  const channels = useContext(ChannelsContext)
  const modalservice = useContext(ModalService)
  const userData = useContext(UserContext)
  const navigate = useNavigate()

  const { isfriends, result } = friends.isFriends(user)
  console.log('is firneds', isfriends)
  let unfriend = () => {
    modalservice.addModal(new Modal('CONFIRM', `Are you sure you want to unfriend ${user?.displayName || user.username}?\n\nThey will not be notified.`, [new ModalAction('Cancel', 'dismiss', 'secondary-grey'), new ModalAction('Confirm', (dismisser) => { client.emit('FriendRequestRemove', { otherid: user.id }); dismisser() }, 'red')]));
  }
  let addfriend = () => {
    friends.send(user._id, true)
  }

  const buttons = [
    {
      label: 'Profile'
    },
    {
      label: 'Message',
      callback: () => {
        channels.forEach((e) => {
          console.log(e.recipients.map(item => item._id).includes(userData._id))
        })
        let channel = channels.find((e) => (e.recipients.map(item => item._id).includes(userData._id) && e.recipients.map(item => item._id).includes(user._id) && e.type == 0))
        navigate('/me/channel/' + channel?._id)
      }
    },
    {
      label: isfriends ? 'Remove Friend' : 'Add Friend',
      callback: isfriends ? unfriend : addfriend
    },
    {
      label: 'Copy User ID'
    }
  ]
  return (
    <GenericContextMenu buttons={buttons} title={''} context={context} />
  )
}
