require("dotenv").config();
const mongoose = require("mongoose");
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

const ObjectID = mongoose.Schema.Types.ObjectId;

exports.Symptom = mongoose.model("symptom", {
  name: String
});

exports.Disease = mongoose.model("disease", {
  name: String,
  symptoms: [
    {
      id: ObjectID,
      name: String
    }
  ],
  solution: String
});

exports.Patient = mongoose.model("patient", {
  name: String,
  dateOfBirth: String,
  gender: Number
});

exports.Consultation = mongoose.model("consultation", {
  dateTime: String,
  diagnose: [ObjectID],
  patient: ObjectID
});

exports.Admin = mongoose.model("admin", {
  username: String,
  password: String
});
