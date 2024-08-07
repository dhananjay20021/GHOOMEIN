const mongodb = require('mongodb');

const db = require('../data/database');

class Event {
    constructor (eventData){
        this.eventname = eventData.eventname;
        this.description = eventData.description;
        this.profileimage = eventData.profileimage;
        this.updateProfileImageData();
        this.coverimage = eventData.coverimage;
        this.updateCoverImageData();
        this.isStatus = +eventData.isStatus;
        this.rules1 = eventData.rules1;
        this.rules2 = eventData.rules2;
        this.rules3 = eventData.rules3;
        this.rules4 = eventData.rules4;
        this.reward1 = eventData.reward1;
        this.reward2 = eventData.reward2;
        this.reward3 = eventData.reward3;
        this.eventParticipationStartDate = new Date(eventData.eventParticipationStartDate);
        this.eventParticipationEndDateVoteStartDate = new Date(eventData.eventParticipationEndDateVoteStartDate);
        this.eventVoteEndDate = new Date(eventData.eventVoteEndDate);
        if (eventData._id){
            this.id =   eventData._id.toString();
        }
        this.eventtype = eventData.eventtype;
        // Set createdAt and updatedAt fields
        this.createdAt = eventData.createdAt || new Date();
        this.updatedAt = eventData.updatedAt || new Date();
    }

  //Find By ID function

  static async findById(eventId) {
    console.log("eventId",eventId);
    let eveId;
    try {
      eveId = new mongodb.ObjectId(eventId);
    } catch (error) {
      error.code = 404;
      throw error;
    }

    const event = await db.getDb().collection("events").findOne({ _id: eveId });

    if (!event) {
      const error = new Error("Could not find event with provided id");
      error.code = 404;
      throw error;
    }
    return new Event(event);
  }

  //Find all attributes function

    // static async findAll() {
    //    const events = await db.getDb().collection('events').find().toArray();

    //    return events.map(function(eventDocument){
    //         return new Event(eventDocument);
    //    });
    // }

    static async findAll() {
      const events = await db
        .getDb()
        .collection('events')
        .find()
        .toArray();
  
        return events.map(function(eventDocument){
          return new Event(eventDocument);
     });
    }

        //update Cover Image Data Method

        updateProfileImageData() {
          this.profileimagePath = `https://ghoomein1.s3.ap-south-1.amazonaws.com/general-data/event-data/images/${this.profileimage}`;
          this.profileimageurl = `https://ghoomein1.s3.ap-south-1.amazonaws.com/general-data/event-data/images/${this.profileimage}`;
        }
      //update Cover Image Data Method
  
      updateCoverImageData() {
        this.coverimagePath = `https://ghoomein1.s3.ap-south-1.amazonaws.com/general-data/event-data/images/${this.coverimage}`;
        this.coverimageurl = `https://ghoomein1.s3.ap-south-1.amazonaws.com/general-data/event-data/images/${this.coverimage}`;
    }
    
  
      //save data in DB function

    async save() {
      // Update updatedAt field
      this.updatedAt = new Date();
        const eventData = {
            eventname : this.eventname,
            description: this.description,
            profileimage: this.profileimage,
            coverimage: this.coverimage,
            isStatus: this.isStatus,
            rules1: this.rules1,
            rules2: this.rules2,
            rules3: this.rules3,
            rules4: this.rules4,
            reward1: this.reward1,
            reward2: this.reward2,
            reward3: this.reward3,
            eventParticipationStartDate: this.eventParticipationStartDate,
            eventParticipationEndDateVoteStartDate :  this.eventParticipationEndDateVoteStartDate,
            eventVoteEndDate: this.eventVoteEndDate,
            eventtype: this.eventtype,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        }
        if (this.id) {
          const eventId = new mongodb.ObjectId(this.id);

          if (!this.profileimage){
            delete eventData.profileimage;
          }

          if (!this.coverimage){
            delete eventData.coverimage;
          }

          if (!this.eventParticipationStartDate){
            delete eventData.eventParticipationStartDate;
          }

          if (!this.eventVoteEndDate){
            delete eventData.eventVoteEndDate;
          }

          await db
            .getDb()
            .collection("events")
            .updateOne({ _id: eventId }, { $set: eventData });
        } else {
          await db.getDb().collection("events").insertOne(eventData);
        }
      }

      async replaceProfileImage(newProfileImage) {
          this.profileimage = newProfileImage;
          this.updateProfileImageData();
        }

        async replaceCoverImage(newCoverImage) {
          this.coverimage = newCoverImage;
          this.updateCoverImageData();
        }

        remove() {
          const eventId = new mongodb.ObjectId(this.id);
          return db.getDb().collection("events").deleteOne({ _id: eventId });
        }

        // Find all upcoming events
  static async findUpcomingEvents() {
    const currentDate = new Date();

    const eventsData = await db
      .getDb()
      .collection('events')
      .find({ eventParticipationStartDate: { $gt: currentDate } })
      .toArray();
      const events = [];
      
      for (const event of eventsData) {
        const participantEventData = await db
          .getDb()
          .collection('participants')
          .aggregate([
            {
              $match: {
                eventId: event._id
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
    
        event.participantEventData = participantEventData;
        events.push(event);
      }
    
      // return events;

    return events.map((eventDocument) => new Event(eventDocument));
  }

  // Find all ongoing events
  // static async findOngoingEvents1() {
  //   const currentDate = new Date();
  //   const events = await db
  //     .getDb()
  //     .collection('events')
  //     .find({ eventParticipationStartDate: { $lte: currentDate }, eventVoteEndDate: { $gte: currentDate } })
  //     .toArray();
    
  //   const eventPromises = events.map(async (event) => {
  //     const participantEventData = await db
  //       .getDb()
  //       .collection('participants')
  //       .aggregate([
  //         {
  //           $match: {
  //             eventId: event._id
  //           }
  //         },
  //         {
  //           $lookup: {
  //             from: 'users',
  //             localField: 'userId',
  //             foreignField: '_id',
  //             as: 'userDetails'
  //           }
  //         },
  //         {
  //           $sort: {
  //             vote: -1 // Sort in descending order of vote
  //           }
  //         },
  //         {
  //           $limit: 3 // Limit the result to 3 documents
  //         }
  //       ])
  //       .toArray();
        
  //     event.participantEventData = participantEventData;
  //     return new Event(event);
  //   });
  //   return Promise.all(eventPromises);
  // }
  
  static async findOngoingEvents() {
    const currentDate = new Date();
    const events = await db
      .getDb()
      .collection('events')
      .find({ eventParticipationStartDate: { $lte: currentDate }, eventVoteEndDate: { $gte: currentDate } })
      .toArray();
    
     return events.map((eventDocument) => new Event(eventDocument));
  }
  

  // Find all previous events
  static async findPreviousEvents() {
    const currentDate = new Date();

    const eventsData = await db
      .getDb()
      .collection('events')
      .find({ eventVoteEndDate: { $lt: currentDate } })
      .toArray();
      const events = [];
  
      for (const event of eventsData) {
        const participantEventData = await db
          .getDb()
          .collection('participants')
          .aggregate([
            {
              $match: {
                eventId: event._id
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
    
        event.participantEventData = participantEventData;
        events.push(event);
      }
    
      return events.map((eventDocument) => new Event(eventDocument));
  }
}

module.exports = Event;