const mongodb = require('mongodb');

const db = require("../data/database");


class Participant{
  constructor(participantData) {
    this.userId = new mongodb.ObjectId(participantData.userId);
    this.eventId = new mongodb.ObjectId(participantData.eventId);
    this.reviewId = new mongodb.ObjectId(participantData.reviewId);
    this.placeId = new mongodb.ObjectId(participantData.placeId);
    this.photo = participantData.photo || null;
    this.updatePhotoData();  
    this.avgRating = participantData.avgRating;
    this.review = participantData.review;
    this.vote = participantData.vote || 0;
    this.votedUserId = participantData.votedUserId || [];
    this.hasVoted = participantData.hasVoted || false;
    if (participantData._id) {
      this.id = participantData._id.toString();
    }
    // Set createdAt and updatedAt fields
    this.createdAt = participantData.createdAt || new Date();
    this.updatedAt = participantData.updatedAt || new Date();
  }

  updatePhotoData() {
    this.photoPath = `https://ghoomein1.s3.ap-south-1.amazonaws.com/general-data/participant-data/images/${this.photo}`;
    this.photourl = `https://ghoomein1.s3.ap-south-1.amazonaws.com/general-data/participant-data/images/${this.photo}`;
  }


  static async findById(participantId) {
    //let participantId;
    try {
      participantId = new mongodb.ObjectId(participantId);
    } catch (error) {
      error.code = 404;
      throw error;
    }
   
    const participant = await db.getDb().collection("participants").findOne({ _id: participantId });

    if (!participant) {
      const error = new Error("Could not find participants with provided id");
      error.code = 404;
      throw error;
    }
    return new Participant(participant);
  }

  static async find(participantId) {
    console.log("argu ",participantId);
    try {
      particiId = new mongodb.ObjectId(participantId);
    } catch (error) {
      error.code = 404;
      throw error;
    }

    const participant = await db.getDb().collection("participants").findOne({_id: particiId});

    if (!participant) {
      const error = new Error("Could not find participants with provided id");
      error.code = 404;
      throw error;
    }
    return new Participant(participant);
  }

  //Find all attributes function

  static async findAll() {
    const participants = await db.getDb().collection("participants").find().toArray();

    return participants.map(function (participantDocument) {
      return new Participant (participantDocument);
    });
  }

  async participateInEvent(eventId) {
    if (this.events.includes(eventId)) {
      throw new Error('User has already participated in this event');
    }
    this.events.push(eventId);
    await this.save();
  }

  async save() {
    // Update updatedAt field
    this.updatedAt = new Date();

    const participantData = {
        userId : this.userId,
        photo: this.photo,
        eventId: this.eventId,
        reviewId: this.reviewId,
        placeId: this.placeId,
        avgRating: this.avgRating,
        review: this.review,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        vote: this.vote,
        votedUserId : this.votedUserId,
        
    }
    if (this.id) {
      const participantId = new mongodb.ObjectId(this.id);

      if (!this.photo){
        delete participantData.photo;
      }
      if (!this.avgRating){
        delete participantData.avgRating;
      }
      if (!this.avgRating){
        delete participantData.avgRating;
      }
      if (!this.reviewId){
        delete participantData.reviewId;
      }
      if (!this.placeId){
        delete participantData.placeId;
      }
       // Set votedUserId field
    participantData.votedUserId = this.votedUserId;
    
      await db
        .getDb()
        .collection("participants")
        .updateOne({ _id: participantId }, { $set: participantData });
    } else {
      const result = await db.getDb().collection("participants").insertOne(participantData);
      this.id = result.insertedId.toString();
    }
  }

  async hasVotedByUserForEvent(userId, eventId) {
    const participant = await db
      .getDb()
      .collection("participants")
      .findOne({ eventId: new mongodb.ObjectId(eventId), votedUserId: userId });
    return participant;
  }

  static async sumVotesForEvenIdParticipants(eventId) {
    console.log("eventId ",eventId);
    const participants = await db.getDb().collection("participants").find({"eventId": new mongodb.ObjectId(eventId)}).toArray();
   console.log("participants ",participants);
    let sum = 0;
    participants.forEach(participant => {
      //if (parseInt(participant.userId) % 2 === 0) {
        sum += participant.vote;
     // }    
    });
  
    return sum;
  }
  

  
}

module.exports = Participant;