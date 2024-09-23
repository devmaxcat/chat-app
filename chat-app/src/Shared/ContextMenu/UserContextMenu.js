import React, { useContext } from 'react'
import GenericContextMenu from './GenericContextMenu'
import { Modal, ModalAction, ModalService, UserContext } from '../../App'
import { ChannelsContext, ClientContext, FriendsContext, ProfileViewerContext } from '../../Chat'
import { useNavigate } from 'react-router'

export default function UserContextMenu({ user, context }) {
  const friends = useContext(FriendsContext)
  const client = useContext(ClientContext)
  const profileViewer = useContext(ProfileViewerContext)
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
  let friendLabel = function (status, from) {
   
    switch (status) {
      case 0: return (from._id == user._id) ? 'Accept Request' : 'Request Pending';
      case 1: return 'Remove Friend';
      default: return 'Add Friend';
    }
  }(result?.status, result?.from)

  const buttons = [
    {
      label: 'Profile',
      callback: () => {
        profileViewer.open(user)
      }
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
      callback: async function () {

        let channel = channels.find((e) => (e.recipients.map(item => item._id).includes(userData._id) && e.recipients.map(item => item._id).includes(user._id) && e.type == 0))
        console.log(channels)
        if (!channel) {
          let newChannels = await channels.refresh('ahhh')
          channel = newChannels.find((e) => (e.recipients.map(item => item._id).includes(userData._id) && e.recipients.map(item => item._id).includes(user._id) && e.type == 0))
         
        }
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
    <GenericContextMenu buttons={buttons} title={''} context={context} />
  )
}
