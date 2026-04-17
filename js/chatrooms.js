import { auth, db } from "./firebase.js";

import {
  ref,
  push,
  onChildAdded,
  set,
  onValue,
  onDisconnect
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";


// ===============================
// ELEMENTS
// ===============================
const input = document.querySelector(".chat-input input");
const button = document.querySelector(".chat-input button");
const messages = document.querySelector(".chat-messages");
const chatHeader = document.querySelector(".chat-header");
const groupList = document.querySelector(".group-list");
const createGroupBtn = document.getElementById("create-group-btn");

const groupModal = document.getElementById("group-modal");
const groupInput = document.getElementById("group-name-input");
const confirmBtn = document.getElementById("confirm-group-btn");
const cancelBtn = document.getElementById("cancel-group-btn");

const inviteModal = document.getElementById("invite-modal");
const inviteInput = document.getElementById("invite-email-input");
const sendInviteBtn = document.getElementById("send-invite-btn");
const cancelInviteBtn = document.getElementById("cancel-invite-btn");
const inviteList = document.querySelector(".invite-list");


// ===============================
// STATE
// ===============================
let currentChannel = "general";
let username = "User";
let currentUser = null;
let unsubscribe = null;
let currentInviteGroup = null;


// ===============================
// AUTH
// ===============================
onAuthStateChanged(auth, (user) => {
  if (!user) return;

  currentUser = user;
  username = localStorage.getItem("username") || "User";

  const userRef = ref(db, "onlineUsers/" + user.uid);
  set(userRef, { username });
  onDisconnect(userRef).remove();

  loadMessages();
  loadOnlineUsers();
  loadGroups(user);
  loadInvites(user);

  createGroupBtn.addEventListener("click", () => openGroupModal(user));
});


// ===============================
// LOAD MESSAGES
// ===============================
function loadMessages(isGroup = false) {
  messages.innerHTML = "";

  if (unsubscribe) unsubscribe();

  let messagesRef = isGroup
    ? ref(db, "groupMessages/" + currentChannel)
    : ref(db, "channels/" + currentChannel + "/messages");

  unsubscribe = onChildAdded(messagesRef, (snapshot) => {
    const msg = snapshot.val();

    const msgEl = document.createElement("div");
    msgEl.classList.add("message");

    const isImage = msg.text.match(/\.(gif|png|jpg|jpeg|webp)$/i);

    msgEl.innerHTML = `
    <strong style="color:white;">${msg.user}:</strong>
    `;

    if (isImage) {
        const img = document.createElement("img");
        img.src = msg.text;
        img.style.maxWidth = "200px";
        img.style.borderRadius = "10px";
        img.style.marginTop = "5px";
        msgEl.appendChild(img);
    } else {
        const span = document.createElement("span");
        span.style.color = "#7dd3fc";
        span.textContent = " " + msg.text;
        msgEl.appendChild(span);
    }

    messages.appendChild(msgEl);
    messages.scrollTop = messages.scrollHeight;
  });
}


// ===============================
// SEND MESSAGE
// ===============================
function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  const activeChannel = document.querySelector(".channel.active");

  let messagesRef = activeChannel?.dataset.type === "group"
    ? ref(db, "groupMessages/" + currentChannel)
    : ref(db, "channels/" + currentChannel + "/messages");

  push(messagesRef, {
    user: username,
    text: text,
    timestamp: Date.now()
  });

  input.value = "";
}


// ===============================
// CHANNEL CLICK
// ===============================
document.addEventListener("click", (e) => {
  const channel = e.target.closest(".channel");
  if (!channel) return;

  document.querySelectorAll(".channel").forEach(c => c.classList.remove("active"));
  channel.classList.add("active");

  if (channel.dataset.type === "group") {
    currentChannel = channel.dataset.groupId;
    chatHeader.textContent = channel.textContent.trim();
    loadMessages(true);
    return;
  }

  if (channel.textContent.includes("General")) currentChannel = "general";
  else if (channel.textContent.includes("Icebreakers")) currentChannel = "icebreakers";

  chatHeader.textContent = channel.childNodes[0].textContent.trim();
  loadMessages(false);
});


// ===============================
// INPUT EVENTS
// ===============================
button.addEventListener("click", sendMessage);
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});


// ===============================
// ONLINE USERS
// ===============================
function loadOnlineUsers() {
  const onlineList = document.querySelector(".online-list");

  onValue(ref(db, "onlineUsers"), (snapshot) => {
    onlineList.innerHTML = "";

    snapshot.forEach(child => {
      const user = child.val();

      const div = document.createElement("div");
      div.classList.add("user");
      div.innerHTML = `<span style="color:#4ade80;">●</span> ${user.username}`;

      onlineList.appendChild(div);
    });
  });
}


// ===============================
// GROUP MODAL
// ===============================
function openGroupModal(user) {
  currentUser = user;
  groupModal.style.display = "flex";
  groupInput.value = "";
}

function closeGroupModal() {
  groupModal.style.display = "none";
}

confirmBtn.addEventListener("click", () => {
  const groupName = groupInput.value.trim();
  if (!groupName) return;

  createGroup(currentUser, groupName);
  closeGroupModal();
});

cancelBtn.addEventListener("click", closeGroupModal);


// ===============================
// CREATE GROUP
// ===============================
function createGroup(user, groupName) {
  const newGroupRef = push(ref(db, "groups"));

  const groupData = {
    name: groupName,
    owner: user.uid,
    members: { [user.uid]: true },
    maxMembers: 5
  };

  set(newGroupRef, groupData);
  set(ref(db, "userGroups/" + user.uid + "/" + newGroupRef.key), true);
}


// ===============================
// LOAD GROUPS
// ===============================
function loadGroups(user) {
  const userGroupsRef = ref(db, "userGroups/" + user.uid);

  onValue(userGroupsRef, (snapshot) => {
    groupList.innerHTML = "";

    snapshot.forEach(child => {
      const groupId = child.key;

      onValue(ref(db, "groups/" + groupId), (groupSnap) => {
        const group = groupSnap.val();
        if (!group) return;

        const div = document.createElement("div");
        div.classList.add("channel");
        div.textContent = "👥 " + group.name;

        div.dataset.groupId = groupId;
        div.dataset.type = "group";

        // 🔥 INVITE BUTTON
        const inviteBtn = document.createElement("div");
        inviteBtn.classList.add("invite-btn");
        inviteBtn.textContent = "+";

        inviteBtn.onclick = (e) => {
          e.stopPropagation();
          openInviteModal(groupId, group.name);
        };

        div.appendChild(inviteBtn);

        groupList.appendChild(div);
      });
    });
  });
}


// ===============================
// INVITE MODAL
// ===============================
function openInviteModal(groupId, groupName) {
  currentInviteGroup = { groupId, groupName };
  inviteModal.style.display = "flex";
  inviteInput.value = "";
}

function closeInviteModal() {
  inviteModal.style.display = "none";
}

sendInviteBtn.addEventListener("click", () => {
  const email = inviteInput.value.trim();
  if (!email) return;

  const key = email.replace(".", "_");

  push(ref(db, "invites/" + key), {
    groupId: currentInviteGroup.groupId,
    groupName: currentInviteGroup.groupName,
    from: currentUser.uid
  });

  closeInviteModal();
});

cancelInviteBtn.addEventListener("click", closeInviteModal);


// ===============================
// INVITES UI (NO MORE CONFIRM)
// ===============================
function loadInvites(user) {
  const key = user.email.replace(".", "_");

  onValue(ref(db, "invites/" + key), (snapshot) => {
    inviteList.innerHTML = "";

    snapshot.forEach(child => {
      const invite = child.val();

      const div = document.createElement("div");
      div.classList.add("invite-item");

      div.innerHTML = `
        <div>${invite.groupName}</div>
        <div class="invite-buttons">
          <button class="accept-btn">Accept</button>
          <button class="reject-btn">Reject</button>
        </div>
      `;

      div.querySelector(".accept-btn").onclick = () => {
        joinGroup(user, invite.groupId);
        set(ref(db, "invites/" + key + "/" + child.key), null);
      };

      div.querySelector(".reject-btn").onclick = () => {
        set(ref(db, "invites/" + key + "/" + child.key), null);
      };

      inviteList.appendChild(div);
    });
  });
}


// ===============================
// JOIN GROUP
// ===============================
function joinGroup(user, groupId) {
  const groupRef = ref(db, "groups/" + groupId);

  onValue(groupRef, (snapshot) => {
    const group = snapshot.val();
    if (!group) return;

    const count = Object.keys(group.members || {}).length;

    if (count >= group.maxMembers) {
      alert("Group is full (max 5 users)");
      return;
    }

    set(ref(db, "groups/" + groupId + "/members/" + user.uid), true);
    set(ref(db, "userGroups/" + user.uid + "/" + groupId), true);

  }, { onlyOnce: true });
}