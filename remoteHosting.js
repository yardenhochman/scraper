const fs = require('fs');
const sha1 = require('sha1');
const superagent = require('superagent');
const fetch = require('node-fetch');

const writeFile = json => {
  fs.writeFile(
    'output2.json',
    JSON.stringify(json, null, 4), //
    function(err) {
      console.log(
        'File successfully written! - Check your project directory for the output2.json file'
      );
    }
  );
};

const posesArray = [
  {
    img:
      'https://www.acropedia.org/wp-content/uploads/2016/09/IMG_1020_mini.jpg',
    title: 'Reverse Foot-To-Foot',
    'Skills with Reverse Foot-To-Foot':
      'Overturn, Dislocate, Footcycle, Riptide, Reverse Wheel of Doom, Foot Salutations, Wheel of Doom',
    'Position Type': 'L-Base',
    Difficulty: 'Intermediate',
    'Number of Persons': '2 Person',
    Tagged: 'Leshem Choshen, Shiri Weitz'
  },
  {
    img:
      'https://www.acropedia.org/wp-content/uploads/2016/12/iClGiKBN_4.jpeg',
    title: 'Sticky Lab',
    'Position Type': 'L-Base',
    Difficulty: 'Intermediate',
    'Number of Persons': '2 Person',
    Tagged: 'Lira Natalie, Maria Prekasnaya'
  }
];
const newPoseArray = [];

const sendPictures = poseArray => {
  if (!poseArray.length)
    return writeFile(newPoseArray);
  const currentPose = poseArray[0];
  console.log(currentPose.img);
  const uploadPreset = 'kphturhe';
  const api_key = '396769864749733';
  const cloudName = 'dz2nxhscn';
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const timestamp = Date.now() / 1000;
  const paramsStr = `timestamp=${timestamp}&upload_preset=${uploadPreset}-MtjkttbQ3j-XPtL4VwET44kzCk`;
  const signature = sha1(paramsStr);
  const params = {
    api_key: api_key,
    timestamp: timestamp,
    upload_preset: uploadPreset,
    signature: signature
  };
  const uploadRequest = superagent.post(url);

  uploadRequest.attach('url', currentPose.img);
  Object.keys(params).forEach(key =>
    uploadRequest.field(key, params[key])
  );
  uploadRequest.end((err, res) => {
    if (err) return console.log(err);

    currentPose.img = res.body.url;
    newPoseArray.push(currentPose);
    poseArray.shift();
    sendPictures(poseArray);
  });
};

sendPictures(posesArray);
