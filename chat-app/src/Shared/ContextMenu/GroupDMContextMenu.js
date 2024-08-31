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
