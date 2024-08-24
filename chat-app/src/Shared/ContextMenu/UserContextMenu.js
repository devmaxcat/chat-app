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

  const { isfriends, result } = friends.isFriends(user._id)
  
  let unfriend = () => {
    modalservice.addModal(new Modal('CONFIRM', `Are you sure you want to unfriend ${user?.displayName || user.username}?\n\nThey will not be notified.`, [new ModalAction('Cancel', 'dismiss', 'secondary-grey'), new ModalAction('Confirm', (dismisser) => { friends.remove(user._id, true); dismisser() }, 'red')]));
  }
  let addfriend = () => {
    friends.send(user._id, true)
  }
  let friendLabel = function (status) {
    switch (status) {
      case 0:  return 'Request Pending';
      case 1:  return 'Remove Friend';
      default: return 'Add Friend';
    }
  }(result?.status)

  const buttons = [
    {
      label: 'Profile'
    },
    {
      label: 'Edit Profile',
      hidden: user._id != userData._id,
      callback: () => {
        navigate('/me/settings/profile')
      }
    },
    {
      label: 'Message',
      hidden: user._id == userData._id,
      callback: () => {
        channels.forEach((e) => {
          console.log(e.recipients.map(item => item._id).includes(userData._id))
        })
        let channel = channels.find((e) => (e.recipients.map(item => item._id).includes(userData._id) && e.recipients.map(item => item._id).includes(user._id) && e.type == 0))
        navigate('/me/channel/' + channel?._id)
      }
    },
    {
      label: friendLabel,
      hidden: user._id == userData._id,
      callback: isfriends ? unfriend : addfriend
    },
    {
      label: 'Copy User ID',
      callback: () => {
        navigator.clipboard.writeText(user._id)
      }
    }
  ]
  return (
    <GenericContextMenu buttons={buttons} title={'Title'} context={context} />
  )
}
