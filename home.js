import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {useLocation} from 'react-router-dom';
import {socket} from './socketManagers/connect'
import './format.css';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Home = () => {
  const location = useLocation()
  const username = location.state.username

  const [reply_id, setReplyId] = useState(null);
  const [inputValue, setInputValue] = useState('');

  const [HomeRender, setHomeRender] = useState(false);
  const [rooms,setRooms] = useState([])
  const [CurrentRoomInfo, setCurrentRoomInfo] = useState({currentRoom:null, currentRoomID:null})
  const [message, setMessage] = useState('')
  const [transcript, setTranscript] = useState([])
  const chatContainerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [replyButton, setReplyButton] = useState(false)

  const navigate = useNavigate();
  const handleSubmit = (event, reply_message) => {
    event.preventDefault();
    
    socket.emit("ReplyMessage",{
      "action": "reply",
      "room_id": CurrentRoomInfo.currentRoomID, 
      "room_name": CurrentRoomInfo.currentRoom, 
      "message_id":Date.now() + Math.random().toString(36).substr(2, 9),
      "message_body":inputValue,
      "reply_message":reply_message})

    setInputValue('');
    setReplyId(null)
    setReplyButton(false)
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  function notify(data){
    toast(`${data.username} sent ${data.message}`, {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark"
      });

  }

  
// gets rooms data
  const getRooms = async()=>{
    try {
      const response = await axios.get('http://localhost:8000/rooms',{withCredentials: true});
      setRooms(response.data.rooms)
      setHomeRender(true)
    } catch (error) {
      console.error('Error in getting room data:', error);
    }
  
  }

  useEffect(() => {
    // Your existing useEffect hooks...

    // Scroll to the bottom of the chat container when transcript changes
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [transcript]); 

  // connects socket
  useEffect(() => {
    socket.connect()
    return () => {
      socket.disconnect()
    };
  }, []);

  // registers and cleanup event listeners
  useEffect(() => {
    function serverReady(){
      console.log("connected to Server.")
      getRooms()
    }

    async function roomChangeStatus(response){
      if (response.error) {
        console.error("Error:", response.error);
      } else {
        const roomTranscript = await axios.post('http://localhost:8000/rooms',{id:response.id, room:response.room},{withCredentials: true});
        setTranscript(roomTranscript.data)
        setCurrentRoomInfo({currentRoom: response.room, currentRoomID: response.id})
      }
    }

    function RecieveMessage(response){
      switch(response.action){
        case'add':
        console.log(response.id)
          setTranscript(prevTranscript => [...prevTranscript, { 
            message: response.message,
            username : response.username,
            id : response.id
           }]);


          break;
        case 'reply':
          console.log(response.id)
          setTranscript(prevTranscript => [...prevTranscript, { 
            message: response.message,
            username : response.username,
            id : response.id,
            reply_parent: response.reply_parent
           }]);
           console.log({ 
            message: response.message,
            username : response.username,
            message_id : response.id,
            reply_parent: response.reply_parent
           })

           break
        default:
          console.log("ERROR")

      }

    }

    function connection_error(error){
      alert('Session has Expired, please Relogin');
      navigate("/login")
    }

    socket.on('serverReady', serverReady);
    socket.on("roomChangeStatus", roomChangeStatus)
    socket.on('RoomMessage', RecieveMessage)
    socket.on('connect_error', connection_error);


    return () => {
      socket.off('serverReady', serverReady);
      socket.off("roomChangeStatus", roomChangeStatus)
      socket.off('RoomMessage', RecieveMessage)
      socket.off('connect_error', connection_error)

    };
  }, []);

function onHovering(id){
  console.log(id)
  if(replyButton === false){
    setIsHovered(true)
    setReplyId(id)
  }

}

function NotHovering(id){
  if (replyButton === false){
    setIsHovered(false)
    setReplyId(null)
    setInputValue('')
    setReplyButton(false)
  }

}

  function switchRoom(roomID, roomName) {
    socket.emit("roomChange", {roomID, roomName})
  }

  function sendMessage(event){
    event.preventDefault()
    socket.emit("SendMessage",{
      "action": "add",
      "room_id": CurrentRoomInfo.currentRoomID, 
      "room_name": CurrentRoomInfo.currentRoom, 
      "message_id":Date.now() + Math.random().toString(36).substr(2, 9),
      "message_body":message})
    setMessage("")
  }

function back_button(){
  socket.emit("back", CurrentRoomInfo.currentRoom)
  setCurrentRoomInfo({currentRoom:null, currentRoomID:null})
}

  return (
    <div>
        {HomeRender &&
        <div>
<div className="welcome-container">
  <p className="welcome-message">Welcome {username} !</p>
  {!CurrentRoomInfo.currentRoomID && (
    <ul className="room-list">
      {rooms.map(room => (
        <li key={room.id}>
          <button className="room-button" onClick={() => switchRoom(room.id, room.name)}>{room.name}</button>
        </li>
      ))}
    </ul>
  )}
</div>


        {CurrentRoomInfo.currentRoomID ?
        <>
                <div className="room-name">
            {CurrentRoomInfo.currentRoom}
        </div>
<button onClick={back_button} className="back-button">Back</button>



          <div className="center-wrapper">
          <div ref={chatContainerRef} className="chat-container">

          {transcript.map(item => (
  <div key={item.id} className={`message-box ${item.username === username ? 'right' : 'left'}`}
  onMouseEnter={() => onHovering(item.id)}
      onMouseLeave={() => NotHovering(item.id)}
  >
    { item.reply_parent === undefined  &&(
      <div>
        <div className="message-header">
          <span className="username">{item.username}</span>
        </div>
        <div className="message-content" >{item.message}</div>
         { isHovered && item.id === reply_id && item.username !== username &&(
        <button onClick={() => setReplyButton(true)} className="reply-button">Reply</button>
      )}
              {replyButton && item.id === reply_id &&(
                <form onSubmit={(event) => handleSubmit(event,item.message)} className="chat-input-form">
      <textarea
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Enter text..."
        className="chat-textarea_"
      />
      <div className="button-group">
        <button type="submit" className="chat-button">Submit</button>
        <button onClick={() => setReplyButton(false)} type="button" className="chat-button">Close</button>
      </div>
      </form>

        )}
      </div>
    )}
    {item.reply_parent !== undefined && (
      <div className="reply-container">
        <div className="reply-parent">{item.reply_parent}</div>
        <div className="reply-header">
          <span className="username">{item.username}</span>
        </div>
        <div className="reply-content">{item.message}</div>
      </div>
    )}
  </div>
))}


      </div>
      <div className="chat-bar">
        <form onSubmit={sendMessage}>
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Type a message..."
            rows={4} // Adjust the number of rows as needed
            className="chat-textarea"
          />
          <button type="submit">Send</button>
        </form>
        </div>

    </div>
    <ToastContainer
position="bottom-right"
autoClose={5000}
hideProgressBar={false}
newestOnTop={false}
closeOnClick
rtl={false}
pauseOnFocusLoss
draggable
pauseOnHover
theme="dark"
/>
        </>
        :
        <>

          <p>No Room Selected</p>
        </>
        }

        </div>



        }

    </div>
  );
};

export default Home;

// can open multiple windows in incognito mode