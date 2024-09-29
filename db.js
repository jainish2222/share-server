const mongoose = require('mongoose');

const dbconnect = async () => {
  try {
      await mongoose.connect("mongodb://localhost:27017/ps1");
      console.log('Connected to the database');
  } catch (error) {
      console.error('Error connecting to the database:', error.message);
  }
};

// Call the connection function
dbconnect();

const formDataSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true, trim: true, lowercase: true },
  name: { type: String, trim: true },
  surname: { type: String, trim: true },
  college: { type: String, trim: true },
  branch: { type: String, trim: true },
  graduationStart: { type: Date },
  graduationEnd: { type: Date },
  projectName: { type: String, trim: true },
  projectDescription: { type: String, trim: true },
  githubLink: { type: String, trim: true },
  liveLink: { type: String, trim: true },
  img: { type: String,require:true }, // New field for image URL
  agreeTerms: { type: Boolean, required: true },
});

const FormData = mongoose.model('FormData', formDataSchema);

module.exports = { FormData };

