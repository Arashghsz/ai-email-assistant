class UserService {
  constructor() {
    this.users = new Map();
    this.sessions = new Map();
  }

  async createUser(profile) {
    const user = {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      created: new Date()
    };
    this.users.set(user.id, user);
    return user;
  }

  async findUserById(id) {
    return this.users.get(id);
  }

  createUserSession(userId, tokens) {
    this.sessions.set(userId, tokens);
  }

  removeUserSession(userId) {
    this.sessions.delete(userId);
  }

  getUserSession(userId) {
    return this.sessions.get(userId);
  }
}

export const userService = new UserService();
export const { createUserSession, removeUserSession } = userService;
