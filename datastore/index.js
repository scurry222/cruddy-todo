const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const Promise = require('bluebird');
const counter = require('./counter');

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, id) => {
    if (err) {
      callback(err);
    }
    fs.writeFile(path.join(exports.dataDir, id + '.txt'), text, (err) => {
      if (err) {
        callback(err);
      }
      callback(null, { id, text });
    });
  });
};

var readFileAsync = Promise.promisify(fs.readFile);

exports.readAll = (callback) => {

  fs.readdir(exports.dataDir, (err, filenames) => {
    if (err) {
      return callback(err);
    }
    var filePromises = _.map(filenames, (filename) => {
      return readFileAsync(path.join(exports.dataDir, filename))
        .then((fileContents) => {
          return {
            id: filename.slice(0, 5),
            text: fileContents.toString()
          };
        });
    });
    Promise.all(filePromises)
      .then((fileContents) => callback(null, fileContents));
  });
};

exports.readOne = (id, callback) => {
  fs.readFile(path.join(exports.dataDir, id + '.txt'), (err, fileData) => {
    if (err) {
      callback(err);
    } else {
      callback(null, { id, text: fileData.toString() });
    }
  });
};

exports.update = (id, text, callback) => {
  exports.readOne(id, (err) => {
    if (err) {
      callback(err);
    } else {
      fs.writeFile(path.join(exports.dataDir, id + '.txt'), text, (err) => {
        if (err) {
          callback(err);
        } else {
          callback(null, { id, text });
        }
      });
    }
  });
};

exports.delete = (id, callback) => {
  fs.unlink(path.join(exports.dataDir, id + '.txt'), (err) => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
