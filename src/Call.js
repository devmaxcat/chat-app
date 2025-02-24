import React, { useContext, useEffect, useRef, useState } from 'react';
import { RequestContext } from './App';
import { useParams } from 'react-router';
import { ChannelsContext, FriendsContext } from './Chat';
import ProfilePicture from './Shared/ProfilePicture';
import { stringToColor } from 'profile-generator-js';
import { set } from 'react-hook-form';
import interact from 'interactjs';
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
  const [isMuted, setIsMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [state, setState] = useState(null);
  const requester = useContext(RequestContext);
  console.log('state', state, meeting?.state);


  class Participant {
    constructor(participantInfo) {
      Object.assign(this, participantInfo);
      if (participantInfo._id === meeting.participantSessionId) {
        this.isMyself = true;
        this.name = "Me";
      }
    }
    speakingTimeout = setTimeout(() => { }, 0);
    set isSpeaking(value) {
      this._isSpeaking = value;
      clearTimeout(this.speakingTimeout);
      this.speakingTimeout = setTimeout(() => {
        this._isSpeaking = false;
        setParticipants(prevParticipants => prevParticipants.map(p => {
          if (p._id === this._id) {
            p.isSpeaking = false;
          }
          return p;
        }));
      }, 1000);
    }
    get isSpeaking() {
      return this._isSpeaking;
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
    meeting.on("activeSpeaker", function (speakerInfo) {
      setParticipants(prevParticipants => prevParticipants.map(p => {
        console.log(speakerInfo.volumeLevel);
        if (p._id === speakerInfo.participantSessionId) {
          p.isSpeaking = true;
        }

        return p;
      }));
    });
    meeting.on("stateChanged", (meetingState) => {setState(meetingState)});

    meeting.on("localTrackStarted", function (item) {
      if (item.type === "video") {

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
      if (item.type === "audio") {
        var track = item.track;
        var mediaStream = new MediaStream([track]);
        setParticipants(prevParticipants => prevParticipants.map(p => {
          if (p._id === meeting.participantSessionId) {
            p.voiceStream = mediaStream;
          }
          return p;
        }));
      }
    });
    meeting.on("localTrackStopped", function (item) {
      if (item.type === "video") {
        setParticipants(prevParticipants => prevParticipants.map(p => {
          if (p._id === meeting.participantSessionId) {
            p.videoStream = null;
          }
          return p;
        }));
        setLocalVideoTrack(null);
      }
      if (item.type === "audio") {
        setParticipants(prevParticipants => prevParticipants.map(p => {
          if (p._id === meeting.participantSessionId) {
            p.voiceStream = null;
          }
          return p;
        }));
      }
    });

    meeting.on("remoteTrackStarted", function (remoteTrackItem) {

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
      if (remoteTrackItem.type === "audio") {
        setParticipants(prevParticipants => prevParticipants.map(p => {
          if (p._id === remoteTrackItem.participantSessionId) {
            p.voiceStream = null;
          }
          return p;
        }));
      }
      if (remoteTrackItem.type === "video") {
        setParticipants(prevParticipants => prevParticipants.map(p => {
          if (p._id === remoteTrackItem.participantSessionId) {
            p.videoStream = null;
          }
          return p;
        }));
      }
    });
    meeting.on("participantLeft", function (participantInfo) {
      setParticipants(prevParticipants => prevParticipants.filter(p => p._id !== participantInfo._id));
    });
    return () => {
      meeting.off("participantJoined");
      meeting.off("activeSpeaker");
      meeting.off("localTrackStarted");
      meeting.off("localTrackStopped");
      meeting.off("remoteTrackStarted");
      meeting.off("remoteTrackStopped");
      meeting.off("participantLeft");
    }
  }, [meeting]);

  async function joinCall() {

    const meeting = new Metered.Meeting();

    const response = await requester(true, '/api/channel/call', 'POST', true, { channelid });

    const meetingInfo = await meeting.join({
      roomURL: `devmaxcatchatapp.metered.live/${channelid}`,
      accessToken: response.token,
    });
    //requester(true, '/api/channel/calljoined', 'POST', true, { channelid });

    setMeeting(prevMeeting => {
      prevMeeting?.leaveMeeting();
      //requester(true, '/api/channel/callleft', 'POST', true, { channelid });
      channels.refresh();
      return meeting;
    }
    );
  }

  async function leaveCall() {
    await meeting.leaveMeeting();
    requester(true, '/api/channel/callleft', 'POST', true, { channelid });
    setMeeting(null);
    channels.refresh();
  }

  if (meeting && isMuted) {
    meeting.stopAudio();
  } else if (meeting) {
    meeting.startAudio();
  }


  const actions = {
    joinCall,
    leaveCall,
    setMeeting,
    setParticipants,
    setIsMuted,
    setIsScreenSharing,

  }
  const info = {
    meeting,
    participants,
    isMuted,
    isScreenSharing,
    state,
  }



  if ('devmaxcatchatapp.metered.live/' + channelid == meeting?.roomUrl) { // the current call is in this channel
    return (
      <div className='call'>
        <div className='participants'>
          {participants.map(p => (<CallParticipant key={p._id} participant={p} />))}
        </div>
        <div className='action-bar center'>
          <CallActions actions={actions} info={info} />
        </div>



      </div>
    );
  } else { // the current call is not in this channel, but we still want to show a preview and our current call.

    return (
      <>
        {<ChannelSpecificPreview channel={channel} actions={actions} info={info} />}
        {meeting ? (
          <CallInWindow participants={participants} meeting={meeting} actions={actions} info={info} />
        ) : ''}

      </>
    );
  }

}

function ChannelSpecificPreview({ channel, actions, info }) {
  if (info.state === 'joining') {
    return (<div className='call'>
      <div className='participants'>
        {channel.meetingParticipants.map(p => (<CallParticipantPreview key={p._id} user={p} />))}
      </div>
      <button className='action-button join' disabled><span className="icon material-symbols-outlined">
        mic
      </span>Joining <span className='loader'></span></button>
    </div>)
  }
  if (channel.meetingParticipants?.length > 0) {
    return (
      <div className='call'>
        <div className='participants'>
          {channel.meetingParticipants.map(p => (<CallParticipantPreview key={p._id} user={p} />))}
        </div>
        <div className='action-bar center'>
          <button className='action-button join' onClick={() => { actions.joinCall(); }}><span className="icon material-symbols-outlined">
            mic
          </span>Join Call</button>
        </div>

      </div>
    );
  } else {
    return (
      <div className=''>
        <button onClick={() => { actions.joinCall(); }}>Start Call</button>
      </div>
    )
  }
}

function CallActions({ actions, info }) {
  return (
    <>
      <button className={`action-button secondary ${info.isScreenSharing ? 'active' : ''}`} onClick={async () => { await info.meeting.startScreenShare(); actions.setIsScreenSharing(true) }}> <span className='icon material-symbols-outlined'>screen_share</span></button>

      <button className={`action-button secondary ${info.isMuted ? 'active' : ''}`} onClick={() => { actions.setIsMuted(!info.isMuted) }}> <span className='icon material-symbols-outlined'>{info.isMuted ? 'mic_off' : 'mic'}</span> </button>
      <button className='action-button secondary leave' onClick={async () => { actions.leaveCall(); }}><span className='icon material-symbols-outlined'>call_end</span></button>
    </>

  )

}

const CallInWindow = ({ participants, meeting, actions, info }) => {
  const dragRef = useRef(null);
  const position = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (dragRef.current) {
      const interactable = interact(dragRef.current)

      interactable
        .draggable({
          inertia: {
            resistance: 30,
            minSpeed: 50,
            endSpeed: 10
          },
          modifiers: [
            interact.modifiers.restrictRect({
              restriction: document.body.getBoundingClientRect(),
            }),

          ],

          listeners: {
            start(event) {
              event.target.classList.add("dragging"); // Add a class for visual feedback
            },
            move(event) {
              position.current.x += event.dx;
              position.current.y += event.dy;

              requestAnimationFrame(() => {
                event.target.style.transform = `translate(${position.current.x}px, ${position.current.y}px)`;
              });
            },
            end(event) {
              event.target.classList.remove("dragging");
              snapToNearestEdge(event.target);
            }
          }

        })


    }
  }, []);

  const snapToNearestEdge = (element) => {
    const bounds = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let newX = position.current.x;
    let newY = position.current.y;

    // Calculate closest edge (left, right, top, bottom)
    const distances = {
      left: bounds.left,
      right: viewportWidth - bounds.right,
      top: bounds.top,
      bottom: viewportHeight - bounds.bottom
    };
    console.log(distances)
    const closestEdge = Object.entries(distances).sort(([k1, v1], [k2, v2]) => v1 - v2)[0][0];
    console.log(closestEdge)
    if (closestEdge === "right") newX = -16;
    if (closestEdge === "left") newX = -viewportWidth + bounds.width + 16;
    if (closestEdge === "top") newY = 0 + 16;
    if (closestEdge === "bottom") newY = viewportHeight - bounds.height - 16;
    Math.clamp = (num, min, max) => Math.min(Math.max(num, min), max);
    newX = Math.clamp(newX, -viewportWidth + bounds.width + 16, -16);
    newY = Math.clamp(newY, 0 + 16, viewportHeight - bounds.height - 16);

    // Apply snapping smoothly
    requestAnimationFrame(() => {
      element.style.transition = "transform 0.3s ease-out";
      element.style.transform = `translate(${newX}px, ${newY}px)`;
      position.current.x = newX;
      position.current.y = newY;

      setTimeout(() => {
        element.style.transition = "";
      }, 300);
    });
  };

  let leadParticipant = participants.find(e => e.isSpeaking) || participants[0];

  return (
    <div className="call inwindow draggable" ref={dragRef}>
      <div className="participants">
        <CallParticipant key={leadParticipant._id} participant={leadParticipant} />
      </div>
      <div className='actions'>
        <CallActions actions={actions} info={info} />
      </div>
    </div>
  );
};

function CallParticipantPreview({ user }) {

  return (
    <div className='participant' style={{ backgroundColor: stringToColor(user.username) }}>
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
  const friends = useContext(FriendsContext);
  const user = friends.getKnownUserById(participant.externalUserId);

  useEffect(() => {
    if (videoRef.current && participant.videoStream) {
      videoRef.current.srcObject = participant.videoStream;
      videoRef.current.hidden = false;
    } else {
      videoRef.current.hidden = true;
    }
    if (participant.name == 'Me') {
      videoRef.current.muted = true
    }

  }, [participant.videoStream]);
  useEffect(() => {
    if (audioRef.current && participant.voiceStream) {
      audioRef.current.srcObject = participant.voiceStream;
    }
    if (participant.name == 'Me') {
      audioRef.current.muted = true
    }
  }, [participant.voiceStream]);

  return (
    <div className={`participant ${participant.isSpeaking ? 'speaking' : ''}`} style={{ backgroundColor: stringToColor(user.username) }}>
      <div className='pfp'>
        <span className='icon material-symbols-outlined'>{participant.voiceStream ? '' : 'mic_off'} </span>
        <ProfilePicture entity={user}></ProfilePicture>
      </div>

      <div hidden>
        {user.username}
      </div>
      <video ref={videoRef} autoPlay playsInline muted></video>
      <audio ref={audioRef} autoPlay playsInline></audio>
    </div>

  );
}
