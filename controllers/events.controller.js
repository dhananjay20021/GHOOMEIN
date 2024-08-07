const mongodb = require('mongodb');

const db = require('../data/database');

const Event = require('../models/event.model');
const Participant = require('../models/participant.model');
const User = require('../models/user.model');
const City = require('../models/city.model');
const Place = require("../models/place.model");

async function getEventDetails(req, res) {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const userLoggedIn = !!req.session.uid; // Check if user is logged in
    const isParticipant = event.participants && event.participants.includes(req.session.uid); // Check if the user is already a participant
    //console.log("userId:" ,req.session.uid,"eventId:", req.params.id);

    // const participantData = await Participant.findAll({userId: req.sessions.uid, eventId: req.params.id});

    if(req.query.participated == "successfully" && req.query.reviewId != null){
      const participants = await db.getDb().collection("participants").findOne({ reviewId: new mongodb.ObjectId(req.query.reviewId) });
      const review = await db.getDb().collection("reviews").findOne({ _id: new mongodb.ObjectId(req.query.reviewId) });
      if(participants == null){
      const participant = new Participant({
        userId : review.userId,
        photo: review.photo,
        placeId: review.placeId,
        eventId: eventId,
        avgRating: review.avgRating,
        review: review.review,
        reviewId : review._id,

      });
      if (!review.photo || event.eventtype == "reviewType"){
        delete participant.photo;
      } 
      await participant.save();
    }
    }

    const participantData = await db
      .getDb()
      .collection('participants')
      .find({userId: new mongodb.ObjectId(req.session.uid),eventId: new mongodb.ObjectId(req.params.id)})
      .toArray(); 
      
      participantData.forEach(participant => {
        participant.photourl = participant.photo ? `https://ghoomein1.s3.ap-south-1.amazonaws.com/general-data/participant-data/images/${participant.photo}` : null;
        });
        
     
    // get all data of a particular event
    /*
    const participantEventData = await db
      .getDb()
      .collection('participants')
      .find({eventId: new mongodb.ObjectId(req.params.id)})
      .toArray(); */
      const participantEventData = await db
      .getDb()
      .collection('participants')
      .aggregate([
        {
          $match: {
            eventId: new mongodb.ObjectId(req.params.id)
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

        const evenIdVotesSum = await Participant.sumVotesForEvenIdParticipants(req.params.id);

        const isVoted = await db
        .getDb()
        .collection('participants')
        .aggregate([
          {
            $match: {
              eventId: new mongodb.ObjectId(req.params.id),
              votedUserId: {
                $in: [req.session.uid]
              }
            }
          }
        ])
        .toArray();

        const cities = await City.findAll();
        const places = await Place.findAll();
        
        
    const voteCount = isVoted.length > 0 ? isVoted[0].count : 0;
    res.render('customer/event/event-details', {
      event: event,
      evenId: eventId, 
      userId: req.session.uid,
      userLoggedIn: userLoggedIn,
      participantData: participantData,
      participantEventData: participantEventData,
      voteCount:voteCount,
      evenIdVotesSum:evenIdVotesSum,
      cities:cities,
      places:places
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getAllEvents(req, res, next) {
  try {
    const events = await Event.findUpcomingEvents(); 
    const cities = await City.findAll();
    const places = await Place.findAll();
    // console.log("events.participantEventData", events.participantEventData)
    res.render('customer/event/all-events', { events: events,cities:cities, places:places });
  } catch (error) {
    next(error);
  }
}

// async function getEventDetails(req, res, next) {
//   try {
//     const event = await Event.findById(req.params.id);
//     res.render('customer/event/event-details', { event: event });
//   } catch (error) {
//     next(error);
//   }
// }

async function getAllOngoingEvents(req, res, next) {
  try {
    const events = await Event.findOngoingEvents();
    const eventsData = [];
    var i=0;
    for (const event of events) {
      const participantEventData = await db
        .getDb()
        .collection('participants')
        .aggregate([
          {
            $match: {
              eventId: new mongodb.ObjectId(event.id)
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              as: 'userDetails'
            }
          },
          {
            $lookup: {
              from: 'events',
              localField: 'eventId',
              foreignField: '_id',
              as: 'eventDetails'
            }
          },
          {
            $sort: {
              vote: -1 // Sort in descending order of vote
            }
          },
          {
            $limit: 3 // Limit the result to 3 documents
          }
        ])
        .toArray();  
        const participantUserData = await db
        .getDb()
        .collection('participants')
        .aggregate([
          {
            $match: {
              $and:[
                  {eventId: new mongodb.ObjectId(event.id)},
                  {userId: new mongodb.ObjectId(req.session.uid)}
              ]
            }
          }
        ])
        .toArray();
        const voteUserData = await db
        .getDb()
        .collection('participants')
        .aggregate([
          {
            $match: {
              $and:[
                  {eventId: new mongodb.ObjectId(event.id)},
                  {
                    votedUserId: {
                      $in: [req.session.uid]
                    }}
              ]
            }
          }
        ])
        .toArray();
        //event.participantEventData = participantEventData;
        event.participantEventData = participantEventData.map((participantDocument) => new Participant(participantDocument));
        event.participantUserData = participantUserData.map((participantDocument) => new Participant(participantDocument));
        event.voteUserData = voteUserData.map((participantDocument) => new Participant(participantDocument));
        eventsData.push(event);
    i++;
    if(events.length == i){
      console.log("events2 ",eventsData);

      const cities = await City.findAll();
      const places = await Place.findAll();
    res.render('customer/event/ongoing-events', { events: eventsData, cities: cities,places: places });
    }
    }
  } catch (error) {
    next(error);
  }
}

async function getAllUpcomingEvents(req, res, next) {
  try {
    const events = await Event.findUpcomingEvents();
    const cities = await City.findAll();
    const places = await Place.findAll();
    res.render('customer/event/upcoming-events', { events: events, cities: cities,places: places  });
  } catch (error) {
    next(error);
  }
}

async function getAllPreviousEvents(req, res, next) {
  try {
    const events = await Event.findPreviousEvents();
    const eventsData = [];
    var i=0;
    for (const event of events) {
      const participantEventData = await db
        .getDb()
        .collection('participants')
        .aggregate([
          {
            $match: {
              eventId: new mongodb.ObjectId(event.id)
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              as: 'userDetails'
            }
          },
          {
            $lookup: {
              from: 'events',
              localField: 'eventId',
              foreignField: '_id',
              as: 'eventDetails'
            }
          },
          {
            $sort: {
              vote: -1 // Sort in descending order of vote
            }
          },
          {
            $limit: 3 // Limit the result to 3 documents
          }
        ])
        .toArray();
        //event.participantEventData = participantEventData;
        event.participantEventData = participantEventData.map((participantDocument) => new Participant(participantDocument));
        eventsData.push(event);
    i++;
    if(events.length == i){
      console.log("events2 ",eventsData);
      const cities = await City.findAll();
      const places = await Place.findAll();
      res.render('customer/event/previous-events', { events: eventsData , cities: cities,places: places  });
    }
    }
  } catch (error) {
    next(error);
  }
}
 
// GET controller for rendering the participate view
async function getParticipatePage(req, res) {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user is logged in or not
    const userLoggedIn = req.session.uid ? true : false;

    // Get the current user object
    const currentUser = await User.findById(req.session.uid);
    const cities = await City.findAll();
    const places = await Place.findAll();

    res.render('customer/event/participate', { event, userLoggedIn, currentUser, cities: cities,places: places  });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
}

const uploadPhoto = async (photo) => {
  // Assuming you have a function to handle file uploads and save the file path
  // Replace this code with your actual implementation
  // Example: const filePath = await savePhoto(photo);
  const filePath = ''; // Replace this with the actual file path
  return filePath;
};

// POST controller for handling the file upload and participation
async function participateInEvent(req, res, next) {
  try {
    const eventId = req.params.id;
    const userId = req.session.uid;
    const photo = req.files && req.files.photo;

    if (!photo) {
      return res.status(400).json({ error: 'No photo uploaded' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const participantData = await db
    .getDb()
    .collection('participants')
    //.find({ userId: req.session.uid,eventId: req.params.id })
    .find({ userId: req.session.uid,eventId: req.params.id})
    .toArray(); 

    if (participantData && participantData.length >0) {
      return res.status(400).json({ error: 'User is already a participant in this event' });
    }

    // Save the photo and update the event participants
    const photoPath = await uploadPhoto(photo[0]); // Assuming you're using multer and expecting a single file
    event.participants.push(userId);
    event.photos.push(photoPath);
    await event.save(); // Save the changes to the event

    const participant = new Participant({
      userId: userId,
      photo: photo[0].filename,
      eventId: eventId
    });
    try {
      await participant.save();
    } catch (error) {
      next(error);
      return;
    }

    // Check if the current user is the participant who just joined
    const isCurrentUser = event.participants[event.participants.length - 1] === userId;

    const cities = await City.findAll();
    const places = await Place.findAll();
    // Render the participate confirmation message
    res.render('customer/event/event-details', { isParticipant: isCurrentUser, userLoggedIn: true, event, req, cities: cities,places: places  });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


async function voteForParticipant(req, res) {
  try {
    const eventId = req.params.id;
    const userId = req.session.uid;
    const participantId = req.body.participantId;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (!event.participants.includes(participantId)) {
      return res.status(400).json({ error: 'Invalid participant' });
    }

    if (event.participants.includes(userId)) {
      return res.status(400).json({ error: 'User is a participant and cannot vote' });
    }

    const participant = await Participant.findById(participantId);
    if (!participant) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    if (!participant.votedUserId) {
      participant.votedUserId = [];
    }

    if (this.hasVoted) {
      throw new Error('Participant has already voted');
    }

    // Check if the user has already voted for this participant
    if (participant.votedUserId.includes(userId)) {
      return res.status(400).json({ error: 'User has already voted for this participant' });
    }

    participant.hasVoted = true;
    participant.votedUserId.push(userId);
    await participant.save();

    const cities = await City.findAll();
    const places = await Place.findAll();


    res.json({ voteCount: participant.votedUserId.length,cities: cities, places: places });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getUserRankPage(req, res) {  
  try {
    const participantEventData = await db
    .getDb()
    .collection('participants')
    .aggregate([
      {
        $match: {
          eventId: new mongodb.ObjectId(req.params.id)
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $lookup: {
          from: 'events',
          localField: 'eventId',
          foreignField: '_id',
          as: 'eventDetails'
        }
      },
      {
        $sort: {
          vote: -1 // Sort in descending order of vote
        }
      },
      {
        $limit: 3 // Limit the result to 3 documents
      }
    ])
    .toArray();

    

  const evenIdVotesSum = await Participant.sumVotesForEvenIdParticipants(req.params.id);
  const cities = await City.findAll();
  const places = await Place.findAll();
  res.render('customer/event/extras/rankpage', {participantEventData : participantEventData,evenIdVotesSum: evenIdVotesSum, cities: cities,places: places})
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


// POST controller for voting in an event
// ...

// async function voteInEvent(req, res) {
//   try {
//     const eventId = req.params.id;
//     const participantId = req.body.participantId;

//     const event = await Event.findById(eventId);
//     if (!event) {
//       return res.status(404).json({ error: 'Event not found' });
//     }

//     const participant = event.participants.find(
//       (participant) => participant._id.toString() === participantId
//     );
//     if (!participant) {
//       return res.status(404).json({ error: 'Participant not found' });
//     }

//     // Check if user has already voted in this event
//     const user = await User.findById(req.session.uid);
//     if (user.votedEvents.includes(eventId) || participantId === req.session.uid) {
//       return res.status(400).json({ error: 'You cannot vote for yourself or vote multiple times' });
//     }

//     // Increment the votes for the participant
//     participant.votes += 1;

//     // Update the vote count for the event
//     event.voteCount += 1;

//     // Save the changes to the event
//     await event.save();

//     // Update user's voted events
//     user.votedEvents.push(eventId);
//     await user.save();

//     // Redirect to the event details page
//     return res.redirect(`/events/${event.id}/participate`);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Server Error' });
//   }
// }

async function createParticipant(req, res, next) {
  if(req.file &&  req.file.photo !=  "null") {
    var participant = new Participant({
      ...req.body,
      photo: req.file.filename
    });
    console.log('req.file.photo',req.file)
   } else{
    var participant = new Participant({
      ...req.body,
    });}

  try {
    const participantData = await db
    .getDb()
    .collection('participants')
    //.find({ userId: req.session.uid,eventId: req.params.id })
    .find({ userId: req.session.uid,eventId: req.params.id})
    .toArray(); 

    if (participantData && participantData.length >0) {
      return res.status(400).json({ error: 'You are already a participant in this Contest' });
    }

    await participant.save();
    res.json({ message: 'Participated' }); // Send participant data as JSON response
  } catch (error) {
    next(error);
    return;
  }
}

async function participatedsuccessfully(req, res, next) {
  try {
    const eventId = req.params.id;
    const userId = req.session.uid;
    const photo = req.files && req.files.photo;
    console.log("eventId ",eventId);

    if (!photo) {
      return res.status(400).json({ error: 'No photo uploaded' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const participantData = await db
    .getDb()
    .collection('participants')
    //.find({ userId: req.session.uid,eventId: req.params.id })
    .find({ userId: req.session.uid,eventId: req.params.id})
    .toArray(); 

    if (participantData && participantData.length >0) {
      return res.status(400).json({ error: 'User is already a participant in this event' });
    }

    // Save the photo and update the event participants
    const photoPath = await uploadPhoto(photo[0]); // Assuming you're using multer and expecting a single file
    event.participants.push(userId);
    event.photos.push(photoPath);
    const Participant = await Participant.findById(participantId);
    await Participant.save();

    // Check if the current user is the participant who just joined
    const isCurrentUser = event.participants[event.participants.length - 1] === userId;

    // Render the participate confirmation message
    res.render('customer/event/event-details', { isParticipant: isCurrentUser, userLoggedIn: true, event, req, cities:cities, place:places  });

    const participant = new Participant({
      ...req.body,
      photo: req.files.photo[0].filename,
    });
  
    try {
      await participant.save();
    } catch (error) {
      next(error);
      return;
    } 
    const cities = await City.findAll();
    const places = await Place.findAll();
    res.render('customer/event/event-details', { userLoggedIn: true, event, req, cities:cities, place:places });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getEventAboutPage(req, res, next){
  console.log("req.params.id",req.params.id);
      const event = await Event.findById(req.params.id);
   res.render('customer/event/extras/abouteventpage', {event : event})
}


async function getEventRewardPage(req, res, next){
  const event = await Event.findById(req.params.id);
   res.render('customer/event/extras/rewardeventpage', {event : event})
} 


async function getEventRulesPage(req, res, next){
    const event = await Event.findById(req.params.id);
   res.render('customer/event/extras/ruleseventpage', {event : event})
}



module.exports = {
    getAllEvents: getAllEvents,
    getEventDetails: getEventDetails,
    getAllOngoingEvents: getAllOngoingEvents,
    getAllUpcomingEvents: getAllUpcomingEvents,
    getAllPreviousEvents: getAllPreviousEvents,
    getParticipatePage: getParticipatePage,
    participateInEvent: participateInEvent,
    voteForParticipant:voteForParticipant,
    createParticipant:createParticipant,
    participatedsuccessfully:participatedsuccessfully,
    getEventAboutPage:getEventAboutPage,
    getEventRewardPage: getEventRewardPage,
    getEventRulesPage:getEventRulesPage,
    getUserRankPage:getUserRankPage

  }

