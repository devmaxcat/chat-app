import React, { useContext } from 'react'
import GenericContextMenu from './GenericContextMenu'
import { Modal, ModalAction, ModalService, RequestContext, UserContext } from '../../App'
import { ChannelsContext, ClientContext, FriendsContext } from '../../Chat'
import { useLocation, useNavigate } from 'react-router'

export default function GroupDMContextMenu({ channel, context }) {

  const channels = useContext(ChannelsContext)
  const modalservice = useContext(ModalService)
  const userData = useContext(UserContext)
  const location = useLocation()
  const navigate = useNavigate()
  const requester = useContext(RequestContext)

  let leave = () => {
    modalservice.addModal(new Modal('CONFIRM', `Are you sure you want to unfriend ${user?.displayName || user.username}?\n\nThey will not be notified.`, [new ModalAction('Cancel', 'dismiss', 'secondary-grey'), new ModalAction('Confirm', (dismisser) => { friends.remove(user._id, true); dismisser() }, 'red')]));
  }
 

  const buttons = [
    {
      label: 'Rename'
    },
    {
      label: 'Change Icon'
    },
    {
      label: 'Leave',
      callback: async () => {
        let data = await requester(true, '/api/channel/leave', 'POST', true, {channelid: channel._id})
        if (!data.error) {
          channels.refresh()
          if (location.pathname.includes(channel._id)) navigate('/me/friends')
         
        }
      }
    },
    {
      label: 'Copy Channel ID',
      callback: () => {
        navigator.clipboard.writeText(channel._id)
      }
    },
    
  ]
  return (
    <GenericContextMenu buttons={buttons} title={''} context={context} />
  )
}
