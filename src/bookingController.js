import Room from './roomModel.js';
import Booking from './bookingModel.js';

import mongoose from 'mongoose';
import {
  getDetailedBooking,
  getDetailedBookings,
} from './helpers/getDetailedBooking.js';
import {
  httpBadRequest,
  httpException,
  httpNotFound,
} from './helpers/httpExceptionBuilder.js';
import { successResponseBuilder } from './helpers/responseBuilder.js';

// Admin can see all; user only can see theirs
export const findAll = async (req, res, next) => {
  try {
    const filter = {};

    // if user -> only show theirs
    if (!req.user.role === 'ADMIN') filter.userId = req.user.id;

    // isReturned
    if (req.query.returned === 'true') filter.isReturned = true;
    if (req.query.returned === 'false') filter.isReturned = false;

    const booking = await Booking.find(filter);

    const detailedBookings = await getDetailedBookings(booking);

    res.json(successResponseBuilder({ bookings: detailedBookings }));
  } catch (err) {
    next(err);
  }
};

// Admin can see all; user only can see theirs
export const findById = async (req, res, next) => {
  try {
    const filter = {};

    // if user -> only show theirs
    if (!req.user.role === 'ADMIN') filter.userId = req.user.id;

    filter._id = mongoose.Types.ObjectId(req.params.id);

    const booking = await Booking.findOne(filter);
    if (!booking) throw httpNotFound();

    const detailedBooking = await getDetailedBooking(booking);

    res.json(successResponseBuilder({ booking: detailedBooking }));
  } catch (err) {
    next(err);
  }
};

export const bookingRoom = async (req, res, next) => {
  try {
    // Verify book availibility
    const room = await Room.findOne({ _id: req.body.roomId });
    if (!room) throw httpNotFound('Book not found');
    

    // Add borrow
    const booking = new Booking({
      userId: req.user.id,
      roomId: req.body.roomId,
      borrowedAt: new Date(),
      isReturned: false,
    });
    const bookingResult = await booking.save();

    // Add borrwerId and -1 numOfAvailableBooks
    await Room.updateOne(
      { _id: req.body.roomId },
      {
        bookerIds: [...room.bookerIds, req.user.id],
      }
    );

    console.log(bookingResult);

    const detailedBooking = await getDetailedBooking(bookingResult);
    res.status(201).json(successResponseBuilder({ booking: detailedBooking }));
  } catch (err) {
    if (['CastError', 'ValidationError'].includes(err?.name)) {
      next(httpBadRequest(err.message));
    }
    next(err);
  }
};

export const returnRoom = async (req, res, next) => {
  try {
    // Change status isReturned to true
    const booking = await Booking.findOneAndUpdate(
      {
        // look for this doc
        userId: mongoose.Types.ObjectId(req.user.id),
        roomId: mongoose.Types.ObjectId(req.body.roomId),
        isReturned: false,
      },
      {
        // and update the doc's value
        isReturned: true,
        returnedAt: new Date(),
      }
    );
    if (!booking) throw httpNotFound('Borrow not found');

    // Remove one borrowerId from book
    const room = await Room.findOne({ _id: req.body.roomId });

    const bookerIndex = room.bookerIds.indexOf(req.user.id);
    room.bookerIds.splice(bookerIndex, 1);

    await Room.updateOne(
      { _id: mongoose.Types.ObjectId(req.body.roomId) },
      {
        bookerIds: room.bookerIds,
      }
    );

    const detailedBooking = await getDetailedBooking(booking);

    res.status(200).json(successResponseBuilder({ borrow: detailedBooking }));
  } catch (err) {
    if (['CastError', 'ValidationError'].includes(err?.name)) {
      next(httpBadRequest(err.message));
    }
    next(err);
  }
};
