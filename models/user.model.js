const bcrypt = require('bcryptjs');
const mongodb = require('mongodb');
const crypto = require('crypto');
const { sendVerificationEmail, generateResetToken } = require('../mailer');

const db = require('../data/database');

class User {
    constructor (userData){
        this.firstname = userData.firstname;
        this.surname =  userData.surname;
        this.email = userData.email;
        this.mobilenumber = userData.mobilenumber || "";
        this.password =  userData.password;
        this.dateofbirth =  userData.dateofbirth;
        this.monthofbirth =  userData.monthofbirth;
        this.yearofbirth =  userData.yearofbirth;
        this.gender = userData.gender;
        this.profileimage =  userData.profileimage;
        this.updateProfileImageData();
        this.coverimage =  userData.coverimage;
        this.updateCoverImageData();
        this.isVerified =  userData.isVerified
        this.verificationToken = userData.verificationToken;
        this.resetToken = userData.resetToken;
        this.isAdmin =  userData.isAdmin;
        // this.gmail = userData.isGmail;
        if (userData._id) {
            this.id = userData._id.toString();
          }
        // Set createdAt and updatedAt fields
        this.createdAt = userData.createdAt || new Date();
        this.updatedAt = userData.updatedAt || new Date();
        
    }
    

    static async findById(userId) {
        try {
          const user = await db.getDb().collection('users').findOne({ _id: new mongodb.ObjectId(userId) });
          if (user) {
            return new User(user);
          }
          return null;
        } catch (error) {
          throw error;
        }
      }

    //update Cover Image Data Method

    updateProfileImageData() {
      this.profileimagePath = `https://ghoomein1.s3.ap-south-1.amazonaws.com/general-data/user-data/images/${this.profileimage}`;
      this.profileimageurl = `https://ghoomein1.s3.ap-south-1.amazonaws.com/general-data/user-data/images/${this.profileimage}`;
    }
    //update Cover Image Data Method

    updateCoverImageData() {
      this.coverimagePath = `https://ghoomein1.s3.ap-south-1.amazonaws.com/general-data/user-data/images/${this.coverimage}`;
      this.coverimageurl = `https://ghoomein1.s3.ap-south-1.amazonaws.com/general-data/user-data/images/${this.coverimage}`;
  }

    async getUserWithSameEmail() {
        const userCollection = db.getDb().collection('users');
        console.log('email', this.email);
        console.log('mobilenumber', this.mobilenumber);
        const user = await userCollection.findOne({
          $or: [
            { email: this.email },
            { mobilenumber: this.email }
          ]
        });
        return user;
      }
    
    async existsAlready(){
        const existingUser =await this.getUserWithSameEmail();
        if (existingUser) {
            return true;
        }
        return false;
    }

    async signup() {
      const hashedPassword = await bcrypt.hash(this.password, 12);
      const dummyProfileImage = 'dummyimage.png';
      const dummyCoverImage = 'dummyimage.png';
      
      if (this.password === '') {
        // If the password is empty, it means the user is signing up with Google
        // So, set isVerified to true and skip the verification token generation
        this.isVerified = true;
        this.verificationToken = '';
      } else {
        // If the user is signing up with an email and password, generate the verification token
        this.isVerified = false;
        this.verificationToken = crypto.randomBytes(20).toString('hex');
      }
      
      const result = await db.getDb().collection('users').insertOne({
        firstname: this.firstname,
        surname: this.surname,
        email: this.email,
        mobilenumber: this.mobilenumber,
        password: hashedPassword,
        dateofbirth: this.dateofbirth,
        monthofbirth: this.monthofbirth,
        yearofbirth: this.yearofbirth,
        gender: this.gender,
        profileimage: dummyProfileImage,
        coverimage: dummyCoverImage,
        verificationToken: this.verificationToken,
        resetToken: '', // Set the reset token to empty initially
        isVerified: this.isVerified,
        isAdmin: false // Set the isAdmin field
      });
    
      this.id = result.insertedId.toString();
    
      if (!this.isVerified) {
        // Send verification email only if the user is not already verified (i.e., signing up with email and password)
        await sendVerificationEmail(this.email, this.verificationToken);
      }
    
      console.log('User saved successfully');
    }
    
    
    async save() {
      const hashedPassword = await bcrypt.hash(this.password, 12);
      // Update updatedAt field
      this.updatedAt = new Date();
    
      const userData = {
        firstname: this.firstname,
        surname: this.surname,
        email: this.email,
        mobilenumber: this.mobilenumber,
        password: hashedPassword,
        profileimage: this.profileimage,
        coverimage: this.coverimage,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        isAdmin: this.isAdmin // Set the isAdmin field
      };
    
      if (this.id) {
        userData._id = new mongodb.ObjectId(this.id);
      }
    
      if (!this.password) {
        delete userData.password;
      }
    
      if (!this.profileimage) {
        delete userData.profileimage;
      }
    
      if (!this.coverimage) {
        delete userData.coverimage;
      }
    
      await db.getDb().collection("users").updateOne(
        { _id: new mongodb.ObjectId(this.id) },
        { $set: userData }
      );
    }

    async replaceProfileImage(newProfileImage) {
      this.profileimage = newProfileImage;
      this.updateProfileImageData();
    }
  
    async replaceCoverImage(newCoverImage) {
      this.coverimage = newCoverImage;
      this.updateCoverImageData();
    }
    
      

        //   remove() {
        //     const userId = new mongodb.ObjectId(this.id);
        //     return db.getDb().collection("users").deleteOne({ _id: userId });
        //   }

          // hasMatchingPassword

          async hasMatchingPassword(hashedPassword) {
            return bcrypt.compare(hashedPassword, this.password);
          }

          static async findOneByEmail(email) {
            try {
              const userCollection = db.getDb().collection('users');
              const user = await userCollection.findOne({ email: email });
              if (user) {
                user.isVerified = user.isVerified || false; // Set the isVerified property
                user.id = user._id.toString(); // Set the id property of the user object
                return new User(user);
              }
              return null;
            } catch (error) {
              throw error;
            }
          }

          static async resetPassword(resetToken, newPassword, newResetToken) {
            try {
              const userCollection = db.getDb().collection('users');
              const user = await userCollection.findOne({
                resetToken: resetToken,
                isVerified: true
              });
          
              if (!user) {
                throw new Error('Invalid reset token or user not verified');
              }
          
              // Remove the reset token and set the new password
              const hashedPassword = await bcrypt.hash(newPassword, 12);
              const updatedUser = await userCollection.findOneAndUpdate(
                { _id: user._id },
                { $set: { password: hashedPassword, resetToken: newResetToken } },
                { returnOriginal: false }
              );
          
              if (!updatedUser.value) {
                throw new Error('Error updating user');
              }
          
              console.log('Password reset successfully');
            } catch (error) {
              throw error;
            }
          }

          
          
      
        }
          
        

module.exports = User;