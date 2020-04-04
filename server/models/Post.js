const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { singlePrivateFileUpload } = require('../aws/s3');

const PostSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  photo: {
    type: String
  }
});

PostSchema.methods.addPhoto = async function(photo) {
  this.photo = await singlePrivateFileUpload(photo);
}

module.exports = mongoose.model('Post', PostSchema);