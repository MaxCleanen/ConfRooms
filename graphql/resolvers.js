const GraphQLDate = require("graphql-date");
const { models } = require("../models");

module.exports = {
  Query: {
    event(root, { id }) {
      return models.Event.findById(id);
    },
    events(root, args, context) {
      return models.Event.findAll(args, context);
    },
    user(root, { id }) {
      return models.User.findById(id);
    },
    users(root, args, context) {
      return models.User.findAll(args, context);
    },
    room(root, { id }) {
      console.log(id);
      let result = models.Room.findById(id);
      console.log(result);
      return result;
    },
    rooms(root, args, context) {
      return models.Room.findAll(args, context);
    },
  },
  Mutation: {
    createUser(root, { input }, context) {
      return models.User.create(input);
    },
    updateUser(root, { id, input }, context) {
      return models.User.findById(id).then((user) => {
        return user.update(input);
      });
    },
    removeUser(root, { id }, context) {
      return models.User.findById(id).then((user) => user.destroy());
    },
    createRoom(root, { input }, context) {
      return models.Room.create(input);
    },
    updateRoom(root, { id, input }, context) {
      return models.Room.findById(id).then((room) => {
        return room.update(input);
      });
    },
    removeRoom(root, { id }, context) {
      return models.Room.findById(id).then((room) => room.destroy());
    },
    createEvent(root, { input, usersIds, roomId }, context) {
      return models.Event.create(input).then((event) => {
        event.setRoom(roomId);
        return event.setUsers(usersIds).then(() => event);
      });
    },
    updateEvent(root, { id, input }, context) {
      return models.Event.findById(id).then((event) => {
        return event.update(input);
      });
    },
    removeUserFromEvent(root, { id, userId }, context) {
      return models.Event.findById(id).then((event) => {
        event.removeUser(userId);
        return event;
      });
    },
    addUserToEvent(root, { id, userId }, context) {
      return models.Event.findById(id).then((event) => {
        event.addUser(userId);
        return event;
      });
    },
    changeEventRoom(root, { id, roomId }, context) {
      return models.Event.findById(id).then((event) => {
        event.setRoom(roomId);
        return event;
      });
    },
    removeEvent(root, { id }, context) {
      return models.Event.findById(id).then((event) => event.destroy());
    },
  },
  Event: {
    users(event) {
      return event.getUsers();
    },
    room(event) {
      return event.getRoom();
    },
  },
  Date: GraphQLDate,
};
