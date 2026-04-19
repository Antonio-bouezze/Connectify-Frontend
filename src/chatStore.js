const CHAT_DATA_STORAGE_KEY = "connectify_chat_data_v2";

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function getNowISO() {
  return new Date().toISOString();
}

function getNowTime() {
  return new Date().toLocaleTimeString();
}

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

function getPairKey(a, b) {
  return [Number(a), Number(b)].sort((x, y) => x - y).join("-");
}

function isPrivateParticipant(chat, userId) {
  return chat.participants.includes(userId);
}

function isRoomMember(room, userId) {
  return room.members.some((member) => member.userId === userId);
}

function normalizeRoom(room) {
  return {
    ...room,
    allowMessaging:
      typeof room.allowMessaging === "boolean" ? room.allowMessaging : true,
    allowNameEdit:
      typeof room.allowNameEdit === "boolean" ? room.allowNameEdit : false,
    allowIconEdit:
      typeof room.allowIconEdit === "boolean" ? room.allowIconEdit : false
  };
}

export function getDefaultChatData() {
  return {
    lastRoomNumber: 1000,
    privateChats: [],
    rooms: [],
    invitations: [],
    privacySettings: {}
  };
}

export function loadChatData() {
  const raw = localStorage.getItem(CHAT_DATA_STORAGE_KEY);

  if (!raw) {
    return getDefaultChatData();
  }

  try {
    const parsed = JSON.parse(raw);

    return {
      ...getDefaultChatData(),
      ...parsed,
      privateChats: parsed.privateChats || [],
      rooms: (parsed.rooms || []).map(normalizeRoom),
      invitations: parsed.invitations || [],
      privacySettings: parsed.privacySettings || {}
    };
  } catch {
    return getDefaultChatData();
  }
}

export function saveChatData(data) {
  localStorage.setItem(CHAT_DATA_STORAGE_KEY, JSON.stringify(data));
}

export function getUserPrivacy(data, userId) {
  return Boolean(data.privacySettings?.[userId]);
}

export function setUserPrivacy(data, userId, isEnabled) {
  const nextData = cloneData(data);
  nextData.privacySettings[userId] = isEnabled;
  return nextData;
}

export function getPrivateChatBetween(data, userAId, userBId) {
  const chatId = `p-${getPairKey(userAId, userBId)}`;
  return data.privateChats.find((chat) => chat.id === chatId) || null;
}

export function createPrivateMessage(data, currentUser, targetUser, text) {
  const nextData = cloneData(data);
  const chatId = `p-${getPairKey(currentUser.userId, targetUser.userId)}`;

  let chat = nextData.privateChats.find((item) => item.id === chatId);

  if (!chat) {
    chat = {
      id: chatId,
      participants: [currentUser.userId, targetUser.userId],
      participantUsernames: {
        [currentUser.userId]: currentUser.username,
        [targetUser.userId]: targetUser.username
      },
      messages: [],
      createdAt: getNowISO()
    };

    nextData.privateChats.unshift(chat);
  }

  chat.participantUsernames[currentUser.userId] = currentUser.username;
  chat.participantUsernames[targetUser.userId] = targetUser.username;

  chat.messages.push({
    id: createId("pm"),
    senderId: currentUser.userId,
    senderUsername: currentUser.username,
    receiverId: targetUser.userId,
    receiverUsername: targetUser.username,
    text: text.trim(),
    timestamp: getNowTime(),
    createdAt: getNowISO(),
    readBy: [currentUser.userId]
  });

  return {
    nextData,
    otherUserId: targetUser.userId
  };
}

export function markPrivateChatRead(data, currentUserId, otherUserId) {
  const nextData = cloneData(data);
  const chatId = `p-${getPairKey(currentUserId, otherUserId)}`;

  const chat = nextData.privateChats.find((item) => item.id === chatId);
  if (!chat) return nextData;

  chat.messages = chat.messages.map((message) => {
    const readBy = message.readBy || [];
    if (!readBy.includes(currentUserId)) {
      return {
        ...message,
        readBy: [...readBy, currentUserId]
      };
    }
    return message;
  });

  return nextData;
}

export function createRoom(data, currentUser, roomName, roomIcon) {
  const nextData = cloneData(data);
  const nextRoomNumber = (nextData.lastRoomNumber || 1000) + 1;
  nextData.lastRoomNumber = nextRoomNumber;

  const room = {
    roomId: `ROOM-${nextRoomNumber}`,
    roomName: roomName.trim().slice(0, 30),
    icon: roomIcon,
    ownerId: currentUser.userId,
    members: [
      {
        userId: currentUser.userId,
        username: currentUser.username
      }
    ],
    messages: [],
    createdAt: getNowISO(),
    allowMessaging: true,
    allowNameEdit: false,
    allowIconEdit: false
  };

  nextData.rooms.unshift(room);

  return {
    nextData,
    room
  };
}

export function getRoomById(data, roomId) {
  return data.rooms.find((room) => room.roomId === roomId) || null;
}

export function updateRoomName(data, currentUser, roomId, nextRoomName) {
  const nextData = cloneData(data);
  const room = nextData.rooms.find((item) => item.roomId === roomId);

  if (!room) {
    return {
      success: false,
      message: "Room not found.",
      nextData: data
    };
  }

  const isRoomLeader = room.ownerId === currentUser.userId;

  if (!isRoomLeader && room.allowNameEdit !== true) {
    return {
      success: false,
      message: "Room name editing is currently disabled.",
      nextData: data
    };
  }

  const safeRoomName = nextRoomName.trim().slice(0, 30);

  if (!safeRoomName) {
    return {
      success: false,
      message: "Room name cannot be empty.",
      nextData: data
    };
  }

  if (room.roomName === safeRoomName) {
    return {
      success: false,
      message: "This room name is already selected.",
      nextData: data
    };
  }

  room.roomName = safeRoomName;

  return {
    success: true,
    message: "Room name updated successfully.",
    nextData
  };
}

export function updateRoomIcon(data, currentUser, roomId, nextIcon) {
  const nextData = cloneData(data);
  const room = nextData.rooms.find((item) => item.roomId === roomId);

  if (!room) {
    return {
      success: false,
      message: "Room not found.",
      nextData: data
    };
  }

  const isRoomLeader = room.ownerId === currentUser.userId;

  if (!isRoomLeader && room.allowIconEdit !== true) {
    return {
      success: false,
      message: "Room icon editing is currently disabled.",
      nextData: data
    };
  }

  if (room.icon === nextIcon) {
    return {
      success: false,
      message: "This icon is already selected.",
      nextData: data
    };
  }

  room.icon = nextIcon;

  return {
    success: true,
    message: "Room icon updated successfully.",
    nextData
  };
}

export function updateRoomPermission(
  data,
  currentUser,
  roomId,
  permissionKey,
  nextValue
) {
  const nextData = cloneData(data);
  const room = nextData.rooms.find((item) => item.roomId === roomId);

  if (!room) {
    return {
      success: false,
      message: "Room not found.",
      nextData: data
    };
  }

  const isRoomLeader = room.ownerId === currentUser.userId;

  if (!isRoomLeader) {
    return {
      success: false,
      message: "Only the room leader can change room permissions.",
      nextData: data
    };
  }

  const allowedKeys = ["allowMessaging", "allowNameEdit", "allowIconEdit"];

  if (!allowedKeys.includes(permissionKey)) {
    return {
      success: false,
      message: "Invalid room permission.",
      nextData: data
    };
  }

  room[permissionKey] = nextValue;

  return {
    success: true,
    message: "Room permission updated successfully.",
    nextData
  };
}

export function leaveRoom(data, currentUser, roomId) {
  const nextData = cloneData(data);
  const roomIndex = nextData.rooms.findIndex((item) => item.roomId === roomId);

  if (roomIndex === -1) {
    return {
      success: false,
      message: "Room not found.",
      nextData: data
    };
  }

  const room = nextData.rooms[roomIndex];

  if (!isRoomMember(room, currentUser.userId)) {
    return {
      success: false,
      message: "You are not a member of this room.",
      nextData: data
    };
  }

  const wasLeader = room.ownerId === currentUser.userId;

  room.members = room.members.filter(
    (member) => member.userId !== currentUser.userId
  );

  if (room.members.length === 0) {
    nextData.rooms.splice(roomIndex, 1);

    return {
      success: true,
      message: "You left the room. The room was deleted because no members remained.",
      nextData,
      roomDeleted: true
    };
  }

  if (wasLeader) {
    room.ownerId = room.members[0].userId;
  }

  return {
    success: true,
    message: wasLeader
      ? "You left the room. Leadership was transferred automatically."
      : "You left the room.",
    nextData,
    roomDeleted: false
  };
}

export function kickMemberFromRoom(data, currentUser, roomId, targetUserId) {
  const nextData = cloneData(data);
  const room = nextData.rooms.find((item) => item.roomId === roomId);

  if (!room) {
    return {
      success: false,
      message: "Room not found.",
      nextData: data
    };
  }

  if (room.ownerId !== currentUser.userId) {
    return {
      success: false,
      message: "Only the room leader can kick members.",
      nextData: data
    };
  }

  if (!isRoomMember(room, targetUserId)) {
    return {
      success: false,
      message: "Target user is not in this room.",
      nextData: data
    };
  }

  if (targetUserId === currentUser.userId) {
    return {
      success: false,
      message: "Use Leave Room if you want to leave the room yourself.",
      nextData: data
    };
  }

  room.members = room.members.filter((member) => member.userId !== targetUserId);

  return {
    success: true,
    message: "Member removed successfully.",
    nextData
  };
}

export function transferRoomLeadership(data, currentUser, roomId, targetUserId) {
  const nextData = cloneData(data);
  const room = nextData.rooms.find((item) => item.roomId === roomId);

  if (!room) {
    return {
      success: false,
      message: "Room not found.",
      nextData: data
    };
  }

  if (room.ownerId !== currentUser.userId) {
    return {
      success: false,
      message: "Only the room leader can transfer leadership.",
      nextData: data
    };
  }

  if (!isRoomMember(room, targetUserId)) {
    return {
      success: false,
      message: "Target user is not in this room.",
      nextData: data
    };
  }

  if (targetUserId === currentUser.userId) {
    return {
      success: false,
      message: "You're already the room leader!",
      nextData: data
    };
  }

  room.ownerId = targetUserId;

  return {
    success: true,
    message: "Leadership transferred successfully.",
    nextData
  };
}

export function markRoomRead(data, currentUserId, roomId) {
  const nextData = cloneData(data);
  const room = nextData.rooms.find((item) => item.roomId === roomId);

  if (!room) return nextData;

  room.messages = room.messages.map((message) => {
    const readBy = message.readBy || [];
    if (!readBy.includes(currentUserId)) {
      return {
        ...message,
        readBy: [...readBy, currentUserId]
      };
    }
    return message;
  });

  return nextData;
}

export function createRoomMessage(data, currentUser, roomId, text) {
  const nextData = cloneData(data);
  const room = nextData.rooms.find((item) => item.roomId === roomId);

  if (!room) {
    return {
      success: false,
      message: "Room not found."
    };
  }

  if (!isRoomMember(room, currentUser.userId)) {
    return {
      success: false,
      message: "You are not a member of this room."
    };
  }

  const isRoomLeader = room.ownerId === currentUser.userId;

  if (room.allowMessaging === false && !isRoomLeader) {
    return {
      success: false,
      message: "Messaging is currently disabled in this room."
    };
  }

  room.messages.push({
    id: createId("rm"),
    senderId: currentUser.userId,
    senderUsername: currentUser.username,
    text: text.trim(),
    timestamp: getNowTime(),
    createdAt: getNowISO(),
    readBy: [currentUser.userId]
  });

  return {
    success: true,
    nextData
  };
}

export function addUserToRoomOrInvite(
  data,
  currentUser,
  roomId,
  targetUser,
  targetPrivacyEnabled
) {
  const nextData = cloneData(data);
  const room = nextData.rooms.find((item) => item.roomId === roomId);

  if (!room) {
    return {
      success: false,
      message: "Room not found.",
      nextData: data
    };
  }

  if (!isRoomMember(room, currentUser.userId)) {
    return {
      success: false,
      message: "Only room members can add other users.",
      nextData: data
    };
  }

  if (isRoomMember(room, targetUser.userId)) {
    return {
      success: false,
      message: "This user is already in the room.",
      nextData: data
    };
  }

  if (targetPrivacyEnabled) {
    const existingPendingInvite = nextData.invitations.find(
      (invite) =>
        invite.roomId === roomId &&
        invite.toUserId === targetUser.userId &&
        invite.status === "pending"
    );

    if (existingPendingInvite) {
      return {
        success: false,
        message: "An invitation is already pending for this user.",
        nextData: data
      };
    }

    nextData.invitations.unshift({
      id: createId("invite"),
      roomId: room.roomId,
      roomName: room.roomName,
      fromUserId: currentUser.userId,
      fromUsername: currentUser.username,
      toUserId: targetUser.userId,
      toUsername: targetUser.username,
      status: "pending",
      createdAt: getNowISO(),
      respondedAt: null,
      senderSeenResult: true
    });

    return {
      success: true,
      status: "invited",
      message: `Invitation sent to ${targetUser.username}.`,
      nextData
    };
  }

  room.members.push({
    userId: targetUser.userId,
    username: targetUser.username
  });

  return {
    success: true,
    status: "added",
    message: `${targetUser.username} was added to the room.`,
    nextData
  };
}

export function getPendingInvitations(data, userId) {
  return data.invitations.filter(
    (invite) => invite.toUserId === userId && invite.status === "pending"
  );
}

export function respondToInvitation(data, invitationId, accept) {
  const nextData = cloneData(data);
  const invitation = nextData.invitations.find((item) => item.id === invitationId);

  if (!invitation || invitation.status !== "pending") {
    return {
      success: false,
      message: "Invitation not found or already handled.",
      nextData: data
    };
  }

  invitation.status = accept ? "accepted" : "declined";
  invitation.respondedAt = getNowISO();
  invitation.senderSeenResult = false;

  if (accept) {
    const room = nextData.rooms.find((item) => item.roomId === invitation.roomId);
    if (room && !isRoomMember(room, invitation.toUserId)) {
      room.members.push({
        userId: invitation.toUserId,
        username: invitation.toUsername
      });
    }
  }

  return {
    success: true,
    invitation,
    nextData
  };
}

export function getDeclinedInvitationResults(data, userId) {
  return data.invitations.filter(
    (invite) =>
      invite.fromUserId === userId &&
      invite.status === "declined" &&
      !invite.senderSeenResult
  );
}

export function dismissDeclineResult(data, invitationId) {
  const nextData = cloneData(data);
  const invitation = nextData.invitations.find((item) => item.id === invitationId);

  if (!invitation) return nextData;

  invitation.senderSeenResult = true;
  return nextData;
}

export function getChatHistoryForUser(data, currentUserId) {
  const history = [];

  data.privateChats.forEach((chat) => {
    if (!isPrivateParticipant(chat, currentUserId)) return;

    const otherUserId = chat.participants.find((id) => id !== currentUserId);
    const otherUsername =
      chat.participantUsernames?.[otherUserId] || `User ${otherUserId}`;

    const unreadMessages = chat.messages.filter(
      (message) =>
        message.senderId !== currentUserId &&
        !(message.readBy || []).includes(currentUserId)
    );

    const lastMessage = chat.messages[chat.messages.length - 1];
    const latestUnreadMessage = unreadMessages[unreadMessages.length - 1];

    history.push({
      type: "private",
      id: chat.id,
      targetId: otherUserId,
      title: otherUsername,
      preview: latestUnreadMessage
        ? latestUnreadMessage.text
        : lastMessage
          ? lastMessage.text
          : "No messages yet",
      unreadCount: unreadMessages.length,
      lastActivity: lastMessage?.createdAt || chat.createdAt
    });
  });

  data.rooms.forEach((room) => {
    if (!isRoomMember(room, currentUserId)) return;

    const unreadMessages = room.messages.filter(
      (message) =>
        message.senderId !== currentUserId &&
        !(message.readBy || []).includes(currentUserId)
    );

    const lastMessage = room.messages[room.messages.length - 1];
    const latestUnreadMessage = unreadMessages[unreadMessages.length - 1];

    const previewSource = latestUnreadMessage
      ? `${latestUnreadMessage.senderUsername}:${latestUnreadMessage.text}`
      : lastMessage
        ? `${lastMessage.senderUsername}:${lastMessage.text}`
        : "Room created";

    history.push({
      type: "room",
      id: room.roomId,
      roomId: room.roomId,
      title: room.roomName,
      preview: previewSource,
      unreadCount: unreadMessages.length,
      lastActivity: lastMessage?.createdAt || room.createdAt
    });
  });

  history.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
  return history;
}