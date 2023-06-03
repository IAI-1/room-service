import mongoose from 'mongoose';
import Room from './roomModel.js';
import {
  httpBadRequest,
  httpNotFound,
} from './helpers/httpExceptionBuilder.js';
import { successResponseBuilder } from './helpers/responseBuilder.js';

export const findAll = async (req, res, next) => {
  try {
    const rooms = await Room.find({});
    res.json(successResponseBuilder({ rooms: rooms }));
  } catch (err) {
    next(err);
  }
};

export const findById = async (req, res, next) => {
  try {
    const id = mongoose.Types.ObjectId(req.params.id);
    const room = await Room.findById({ _id: id }).exec();
    if (!room) throw httpNotFound();
    res.json(successResponseBuilder({ room: room }));
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const room = new Room(req.body);
    const result = await room.save();
    res.status(201).json(successResponseBuilder({ room: result }));
  } catch (err) {
    if (['CastError', 'ValidationError'].includes(err?.name)) {
      next(httpBadRequest(err.message));
    }
    next(err);
  }
};

export const updateById = async (req, res, next) => {
  try {
    const id = mongoose.Types.ObjectId(req.params.id);
    const room = await Room.findOneAndUpdate({ _id: id }, req.body);
    if (!room) throw httpNotFound();

    res.json(successResponseBuilder({ room: room }));
  } catch (err) {
    next(err);
  }
};

export const deleteById = async (req, res, next) => {
  try {
    const id = mongoose.Types.ObjectId(req.params.id);

    const room = await Room.findOneAndDelete({ _id: id });
    if (!room) throw httpNotFound();

    res.json(successResponseBuilder({ deletedRoomId: id }));
  } catch (err) {
    next(err);
  }
};
