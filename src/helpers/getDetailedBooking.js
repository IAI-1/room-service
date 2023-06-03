import Room from '../roomModel.js';
import User from '../userModel.js';

export const getDetailedBooking = async (booking) => {
  try {
    const detailedBooking = {
      ...booking._doc,
      room: await Room.findOne({ _id: booking.bookId }),
      user: await User.findOne({ _id: booking.userId }),
    };
    return detailedBooking;
  } catch (error) {
    return error;
  }
};

export const getDetailedBookings = async (bookings) => {
  try {
    // memoization
    // note: meski kurang efektif karena banyak request async bersamaan,
    //       tetapi masih bisa mengurangi jumlah request ke db
    const rooms = {};
    const users = {};

    // start mapping
    const detailedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const detailedBooking = { ...booking._doc };

        if (rooms[booking.roomId]) {
          // get from memo
          detailedBooking.room = rooms[booking.roomId];
        } else {
          const room = await Room.findOne({ _id: booking.roomId });
          detailedBooking.room = room;
          rooms[booking.roomId] = room;
        }

        if (users[booking.userId]) {
          // get from memo
          detailedBooking.user = users[booking.userId];
        } else {
          const user = await User.findOne({ _id: booking.userId });
          detailedBooking.user = user;
          users[booking.userId] = user;
        }

        return detailedBooking;
      })
    );

    return detailedBookings;
  } catch (error) {
    return error;
  }
};
