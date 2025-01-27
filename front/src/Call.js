import React, { useContext, useEffect, useRef, useState } from 'react';
import { RequestContext } from './App';
import { useParams } from 'react-router';
import { ChannelsContext } from './Chat';
import ProfilePicture from './Shared/ProfilePicture';
const Metered = window.Metered;

const $ = function (selector) {
  return document.querySelector(selector);
}

export default function Call({ }) {
  const { channelid } = useParams()
  const channels = useContext(ChannelsContext)
  const channel = channels.find((e) => e?._id == channelid)
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [meeting, setMeeting] = useState(null);
  const [participants, setParticipants] = useState([]);

  const requester = useContext(RequestContext);

  console.log(meeting);

  class Participant {
    constructor(participantInfo) {
      Object.assign(this, participantInfo);
      if (participantInfo._id === meeting.participantSessionId) {
        this.isMyself = true;
        this.name = "Me";
      }
    }
  }

  useEffect(() => {
    if (!meeting) {
      return;
    }

    const updateParticipants = () => {
      const updatedParticipants = meeting._onlineParticipants.map(p => new Participant(p));
      setParticipants(updatedParticipants);
    };

    updateParticipants();

    meeting.on("participantJoined", function (participantInfo) {
      updateParticipants();
    });

    meeting.on("localTrackStarted", function (item) {
      if (item.type === "video") {
        console.log(item, 'localTrackStarted', meeting, participants.find(p => p._id === meeting.participantSessionId), participants);
        var track = item.track;
        var mediaStream = new MediaStream([track]);
        setParticipants(prevParticipants => prevParticipants.map(p => {
          if (p._id === meeting.participantSessionId) {
            p.videoStream = mediaStream;
          }
          return p;
        }));
        setLocalVideoTrack(mediaStream);
      }
    });

    meeting.on("remoteTrackStarted", function (remoteTrackItem) {
      console.log("remoteTrackStarted", remoteTrackItem);
      if (remoteTrackItem.type === "video") {
        var track = remoteTrackItem.track;
        var stream = new MediaStream([track]);
        setParticipants(prevParticipants => prevParticipants.map(p => {
          if (p._id === remoteTrackItem.participantSessionId) {
            p.videoStream = stream;
          }
          return p;
        }));
      }
      if (remoteTrackItem.type === "audio") {
        var track = remoteTrackItem.track;
        var stream = new MediaStream([track]);
        setParticipants(prevParticipants => prevParticipants.map(p => {
          if (p._id === remoteTrackItem.participantSessionId) {
            p.voiceStream = stream;
          }
          return p;
        }));
      }
    });

    meeting.on("remoteTrackStopped", function (remoteTrackItem) {

    });
    meeting.on("participantLeft", function (participantInfo) {
      setParticipants(prevParticipants => prevParticipants.filter(p => p._id !== participantInfo._id));
    });
  }, [meeting]);

  async function joinCall() {
    const meeting = new Metered.Meeting();

    const response = await requester(true, '/api/channel/call', 'POST', true, { channelid });
    console.log(response)
    const meetingInfo = await meeting.join({
      roomURL: `devmaxcatchatapp.metered.live/${channelid}`,
      accessToken: response.token,
    });
    requester(true, '/api/channel/calljoined', 'POST', true, { channelid });

    setMeeting(meeting);
  }

  async function leaveCall() {
    await meeting.leaveMeeting();
    requester(true, '/api/channel/callleft', 'POST', true, { channelid });
    setMeeting(null);
  }
  channel.meetingParticipants = [{
    "_id": "67362c690eb0c2f23d92a789",
    "username": "test",
    "password": "$2b$10$SkEnbVZoTe.Fk5QNf2kCCeyKSqPvcNJ2IhViV7zlyjX854dQHz3Uy",
    "long_session_identifier": "",
    "role": "Basic",
    "lastActive": "2024-11-14T16:59:21.940Z",
    "createdAt": "2024-11-14T16:59:21.941Z",
    "updatedAt": "2025-01-24T21:23:04.741Z",
    "__v": 0,
    "activityStatus": {
      "statusType": 1,
      "date": "2025-01-24T21:23:04.741Z"
    },
    "bio": "",
    "displayName": "Test"
  }, {
    "_id": "67362c690eb0c2f23d92a789",
    "username": "test",
    "password": "$2b$10$SkEnbVZoTe.Fk5QNf2kCCeyKSqPvcNJ2IhViV7zlyjX854dQHz3Uy",
    "long_session_identifier": "",
    "role": "Basic",
    "lastActive": "2024-11-14T16:59:21.940Z",
    "createdAt": "2024-11-14T16:59:21.941Z",
    "updatedAt": "2025-01-24T21:23:04.741Z",
    "__v": 0,
    "activityStatus": {
      "statusType": 1,
      "date": "2025-01-24T21:23:04.741Z"
    },
    "bio": "",
    "displayName": "Test"
  }]
  if (!meeting && channel.meetingParticipants?.length > 0) {
    return (
      <div className='call'>
        <div className='participants'>
          {channel.meetingParticipants.map(p => (<CallParticipantPreview key={p._id} user={p} />))}
        </div>
        <div className='action-bar center'>
        <button className='action-button join' onClick={() => { joinCall(); console.log('click') }}><span className="icon material-symbols-outlined">
          mic
        </span>Join</button>
        </div>
       
      </div>
    );
  } else if (!meeting) {
    return (
      <div className=''>
        <button onClick={() => { joinCall(); console.log('click') }}>Start Call</button>
      </div>
    )
  }

  return (
    <div className='call'>
      <button onClick={async () => { await meeting.startScreenShare(); }}>Share Screen</button>
      <button onClick={async () => { leaveCall(); }}>Leave</button>
      <button onClick={() => { meeting.startAudio(); }}></button>
      <button onClick={() => { meeting.stopAudio(); }}></button>
      <div className='participants'>
        {participants.map(p => (<CallParticipant key={p._id} participant={p} />))}
      </div>

    </div>
  );
}
function CallParticipantPreview({ user }) {
  console.log(user)
  return (
    <div className='participant'>
      <div className='pfp'>
        <ProfilePicture entity={user}></ProfilePicture>
      </div>

      <div hidden>
        {user.username}
      </div>
      <video autoPlay playsInline muted></video>
    </div>
  );
}

function CallParticipant({ participant }) {
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && participant.videoStream) {
      videoRef.current.srcObject = participant.videoStream;
    }
  }, [participant.videoStream]);
  useEffect(() => {
    if (audioRef.current && participant.voiceStream) {
      audioRef.current.srcObject = participant.voiceStream;
    }
  }, [participant.voiceStream]);

  return (
    <div className='participant'>
      <div>
        {participant.name}
      </div>
      <video ref={videoRef} autoPlay playsInline muted></video>
      <audio ref={audioRef} autoPlay playsInline></audio>
    </div>
  );
}
