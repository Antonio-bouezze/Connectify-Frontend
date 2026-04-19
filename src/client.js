const USERS_STORAGE_KEY = "connectify_users";
let nextUserId = 1000;

export function getStoredUsers() {
  const users = localStorage.getItem(USERS_STORAGE_KEY);
  return users ? JSON.parse(users) : [];
}

function saveStoredUsers(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function getNextUserId(users) {
  if (users.length === 0) return nextUserId;

  const maxId = Math.max(...users.map((user) => user.userId));
  return maxId + 1;
}

export function getUserById(userId) {
  return getStoredUsers().find((user) => user.userId === Number(userId)) || null;
}

export function findUserByTarget(targetInput) {
  const users = getStoredUsers();
  const trimmedTarget = targetInput.trim();

  if (/^\d+$/.test(trimmedTarget)) {
    return users.find((user) => user.userId === Number(trimmedTarget)) || null;
  }

  return (
    users.find(
      (user) => user.username.toLowerCase() === trimmedTarget.toLowerCase()
    ) || null
  );
}

export function registerUser(formData) {
  const users = getStoredUsers();

  const usernameExists = users.some(
    (user) => user.username.toLowerCase() === formData.username.toLowerCase()
  );

  if (usernameExists) {
    return {
      success: false,
      message: "This username already exists."
    };
  }

  const newUser = {
    userId: getNextUserId(users),
    firstName: formData.firstName,
    lastName: formData.lastName,
    dateOfBirth: formData.dateOfBirth,
    phoneNumber: formData.phoneNumber,
    email: formData.email,
    username: formData.username,
    password: formData.password,
    icon:formData.icon,
    iconColor:formData.iconColor
  };

  users.push(newUser);
  saveStoredUsers(users);

  return {
    success: true,
    user: newUser
  };
}

export function loginUser(username, password) {
  const users = getStoredUsers();

  const foundUser = users.find(
    (user) =>
      user.username.toLowerCase() === username.trim().toLowerCase() &&
      user.password === password
  );

  if (!foundUser) {
    return {
      success: false,
      message: "Invalid username or password."
    };
  }

  return {
    success: true,
    user: foundUser
  };
}
export function updateUserAvatar(userId, nextIcon, nextIconColor) {
  const users = getStoredUsers();

  const updatedUsers = users.map((user) => {
    if (user.userId !== Number(userId)) {
      return user;
    }

    return {
      ...user,
      icon: nextIcon,
      iconColor: nextIconColor
    };
  });

  saveStoredUsers(updatedUsers);

  return updatedUsers.find((user) => user.userId === Number(userId)) || null;
}