
const mongodb = require('mongodb');

const db = require('../data/database');
const Participant = require('../models/participant.model');
const Event = require("../models/event.model");
const Place = require("../models/place.model");
const City = require("../models/city.model");


async function addVote(req, res, next) {
  const participantId = req.params.id;
  const userId = req.session.uid;
  const eventId = req.query.eventId;

  try {
    const participant = await Participant.findById(participantId);
    var hasVotedByUserForEvent = await participant.hasVotedByUserForEvent(userId, eventId);
    if (hasVotedByUserForEvent == null) {
        await db
        .getDb()
        .collection("participants")
        .updateOne(
          { _id: new mongodb.ObjectId(participantId) },
          {
            $inc: { vote: 1 },
            $push: { votedUserId: userId },
          }
        );
    }
    // Fetch the updated participant data
    const updatedParticipant = await Participant.findById(participantId);

    // Fetch all participants for the event
    const participants = await Participant.findAll();

    // Update participantData for each participant
    const participantData = participants.map(participant => {
      // Check if the participant has been voted by the user
      const voted = participant.votedUserId && participant.votedUserId.includes(userId);

      // Update the participant's vote status
      if (participant.id === participantId) {
        participant.vote = voted ? 1 : 0;
      }

      return participant;
    });

    const participantD = await Participant.findById(participantId);
    const event = await Event.findById(participantD.eventId);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const userLoggedIn = !!req.session.uid; // Check if user is logged in
    const isParticipant = event.participants && event.participants.includes(req.session.uid); // Check if the user is already a participant

    const participantEventData = await db
      .getDb()
      .collection('participants')
      .aggregate([
        {
          $match: {
            eventId: new mongodb.ObjectId(eventId)
          }
        },
        {
          $lookup: {
            from: 'places',
            localField: 'placeId',
            foreignField: '_id',
            as: 'placeDetails'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userDetails'
          }
        }
      ])
      .toArray();

      const evenIdVotesSum = await Participant.sumVotesForEvenIdParticipants(eventId);  
      
      const isVoted = await db
      .getDb()
      .collection('participants')
      .aggregate([
        {
          $match: {
            eventId: new mongodb.ObjectId(eventId),
            votedUserId: {
              $in: [req.session.uid]
            }
          }
        },
        {
          $count: 'count'
        }
      ])
      .toArray();

      const places = await Place.findAll();
      const cities = await City.findAll();
    
      const voteCount = isVoted.length > 0 ? isVoted[0].count : 0;
      console.log("voteCount")
      res.render('customer/event/event-details', {
        event: event,
        userId: req.session.uid,
        userLoggedIn: userLoggedIn,
        participantData: participantData,
        participantEventData: participantEventData,
        voteCount:voteCount,
        evenIdVotesSum: evenIdVotesSum,        // Pass the sum as a variable to the view
        cities:cities,
        places:places
      });
    } catch (error) {
    // Handle any errors that occurred during the update
    next(error);
  }
}

module.exports = {
  addVote: addVote
};