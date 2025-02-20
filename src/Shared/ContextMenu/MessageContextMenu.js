import React, { useContext } from 'react'
import GenericContextMenu from './GenericContextMenu'
import { Modal, ModalAction, ModalService, UserContext } from '../../App'
import { ChannelsContext, ClientContext, FriendsContext, ProfileViewerContext } from '../../Chat'
import { useNavigate } from 'react-router'

export default function UserContextMenu({ message, context }) {
  const friends = useContext(FriendsContext)
  const client = useContext(ClientContext)
  const profileViewer = useContext(ProfileViewerContext)
  const channels = useContext(ChannelsContext)
  const modalservice = useContext(ModalService)
  const userData = useContext(UserContext)
  const navigate = useNavigate()
 
  
  const buttons = [
    {
      label: 'Copy Message',
      callback: () => {
        navigator.clipboard.writeText(message.text_content)
      }
    },
    {
      label: 'Copy Message ID',
      callback: () => {
        navigator.clipboard.writeText(message._id)
      }
    }
  ]
  return (
    <GenericContextMenu buttons={buttons} title={''} context={context} />
  )
}
