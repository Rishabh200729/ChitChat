const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const msg = document.getElementById("msg");
const spinner = document.getElementById("spinner");
// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// Message submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get message text
  let msg = e.target.elements.msg.value;

  msg = msg.trim();

  if (!msg) {
    return false;
  }

  // Emit message to server
  socket.emit('chatMessage', msg);
  // Clear input
  //need to target emojiareone editor class to empyt string due to jquery emojieonenarea is a another website
  $(".emojionearea-editor").html('');
  $("#msg").focus();
});

// Join chatroom
socket.emit('joinRoom', { username, room });

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

//this message is displayed when a user connects
socket.on("welcomeMsg",(message)=>{
  outputWelcomeMsg(message);
  message.text.userMsgs.forEach(msg=>{
    outputPreviousMessages(msg);
  })
})

//this message is displayed when a user connects
socket.on('joiningMsg', (message) => {
  outputMessage(message);
  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

//this message is displayed when a user leaves the chatRoom
socket.on('leavingMsg', (message) => {
  outputMessage(message);
  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

//get message from server
socket.on("chatMessage",(username,msg,time)=>{
  outputChatMessage(username, msg, time);
  window.scrollTo(0, document.body.scrollHeight);
});

// Output a joining msg to DOM or leaving Messgae to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.style.backgroundColor = "#F4F4F8";
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.username;
  p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  if(typeof message.text === "string"){ // message from chatcord about user leaving and joining
    para.innerText = message.text
  }
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

//display previous messages to DOM
function outputPreviousMessages({createdBy,msg,time}){ 
  const div = document.createElement('div');
  const p = document.createElement('p');
  const para = document.createElement('p');
  addClasses(div, p, para);
  if(createdBy == username){
    p.style.color = "black";
    div.style.backgroundColor = "#B3B7EE"
  }
  p.innerText = createdBy;
  p.innerHTML += `<span class="time">${time}</span>`;
  div.appendChild(p);
  para.innerText = msg
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}

//this function ouputs the welcome msg to th screen
function outputWelcomeMsg(msg){
  const div = document.createElement('div');
  const p = document.createElement('p');
  const para = document.createElement('p');
  addClasses(div, p, para);
  div.style.backgroundColor = "#F4F4F8";
  p.innerText = msg.username;
  p.innerHTML += `<span class="time">${msg.time}</span>`;
  div.appendChild(p);
  para.innerText = msg.text.welcomeMsg
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}

//output chatMessage to DOM
function outputChatMessage(name, msg, time){
  const div = document.createElement('div');
  const p = document.createElement('p');
  const para = document.createElement('p');
  addClasses(div, p, para);
  p.innerText = name;
  if(name === username){
    p.style.color = "black";
    div.style.backgroundColor = "#B3B7EE"; 
  }
  p.innerHTML += `<span class="time">${time}</span>`;
  div.appendChild(p);
  para.innerText = msg
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}
//this function adds classes to DOM elements
function addClasses(div, p, para){
  div.classList.add('message');
  p.classList.add('meta');
  para.classList.add('text');
}
//Prompt the user before leave chat room
document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
  if (leaveRoom) {
    window.location = '../index.html';
  }
});
