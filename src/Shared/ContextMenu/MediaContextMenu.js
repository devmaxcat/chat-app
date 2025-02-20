import React, { useContext } from 'react'
import GenericContextMenu from './GenericContextMenu'
import { Modal, ModalAction, ModalService, UserContext } from '../../App'
import { ChannelsContext, ClientContext, FriendsContext, ProfileViewerContext } from '../../Chat'
import { useNavigate } from 'react-router'

export default function UserContextMenu({ media, context }) {
  const friends = useContext(FriendsContext)
  const client = useContext(ClientContext)
  const profileViewer = useContext(ProfileViewerContext)
  const channels = useContext(ChannelsContext)
  const modalservice = useContext(ModalService)
  const userData = useContext(UserContext)
  const navigate = useNavigate()
 
  console.log(media)

  const buttons = [
    {
      label: 'Copy Media Link',
      callback: () => {
        navigator.clipboard.writeText(media.secure_url)
      }
    },
  ]
  return (
    <GenericContextMenu buttons={buttons} title={''} context={context} />
  )
}
