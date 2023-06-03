import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Types.ObjectId,
      required: true,
      unique: false,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
      unique: false,
    },
    borrowedAt: {
      type: Date,
      required: true,
    },
    returnedAt: {
      type: Date,
      required: false,
    },
    isReturned: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
