import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    roomName: {
      type: String,
      required: true,
    },
    roomtype: {
      type: String,
      required: true,
    },
    numOfRooms: {
      type: Number,
      required: true,
    },
    numOfAvailableRooms: {
      type: Number,
      default: function () {
        return this.numOfRooms;
      },
    },
    bookerIds: {
      type: [mongoose.Types.ObjectId],
      required: false,
    },
  },
  { timestamps: true }
);

const Room = mongoose.model('Room', roomSchema);

export default Room;
