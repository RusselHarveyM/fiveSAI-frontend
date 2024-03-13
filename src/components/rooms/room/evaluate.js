import axios from "axios";

const SORT = {
  wasteDisposal: 0,
  clutter: 0,
  cabinet: 0,
  danglings: 0,
  drawer: 0,
  shelf: 0,
  score: 0,
};

const SET = {
  organization: 0,
  ventilation: 0,
  aircon: 0,
  exhaust: 0,
  score: 0,
};

const SHINE = {
  adhesives: 0,
  damage: 0,
  dirt: 0,
  dust: 0,
  litter: 0,
  smudge: 0,
  stain: 0,
  score: 0,
};

async function countDesksChairs(image) {
  let response = {
    predictions: [],
  };
  await axios({
    method: "POST",
    url: "https://detect.roboflow.com/classroom-count-det/5",
    params: {
      api_key: "OeSBdrSNcfGEme3a9fDf",
    },
    data: image,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
    .then(function (res) {
      response = res.data;
      console.log("count >>> ", res.data);
    })
    .catch(function (error) {
      console.log(error.message);
    });
  return { count: response.predictions.length, data: response };
}

async function organizationCheck(image, set) {
  let response = {
    predictions: [],
  };
  let results = {
    organized: [],
    disorganized: [],
  };
  await axios({
    method: "POST",
    url: "https://detect.roboflow.com/classroom-order-seg/9",
    params: {
      api_key: "OeSBdrSNcfGEme3a9fDf",
    },
    data: image,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
    .then(function (res) {
      response = res;
      console.log("organize check >>>", res.data);
    })
    .catch(function (error) {
      console.log(error.message);
    });
  results.disorganized = [
    response?.predictions?.filter((pred) => pred.class == "disorganized"),
  ];
  results.organized = [
    response?.predictions?.filter((pred) => pred.class == "organized"),
  ];
  let overall = results.organized.length + results.disorganized.length;
  set.organization = (results.organized.length / overall) * 10;
}

async function personalBelongingsCheck(image) {
  let response = {
    predictions: [],
  };
  await axios({
    method: "POST",
    url: "https://detect.roboflow.com/classroom-3igmn/7",
    params: {
      api_key: "OeSBdrSNcfGEme3a9fDf",
    },
    data: image,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
    .then(function (res) {
      response = res.data;
      console.log("personalBelongings check >>> ", res.data);
    })
    .catch(function (error) {
      console.log(error.message);
    });
  return response.predictions;
}

async function blueDetection(image, sort, set) {
  let response = {
    predictions: [],
  };

  await axios({
    method: "POST",
    url: "https://detect.roboflow.com/classroom-blue-det/2",
    params: {
      api_key: "OeSBdrSNcfGEme3a9fDf",
    },
    data: image,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
    .then(function (res) {
      // Log the response data for each request
      console.log("blue >>>", res.data);
      response = res.data;
    })
    .catch(function (error) {
      console.log(error.message);
    });
  response.predictions.forEach((prediction) => {
    console.log("blue prediction foreach", prediction);
    if (prediction.class == "trashcan") sort.wasteDisposal++;
    if (prediction.class == "cabinet") sort.cabinet++;
    if (prediction.class == "dangling wire/cable") sort.danginglings++;
    if (prediction.class == "drawer") sort.drawer++;
    if (prediction.class == "shelf") sort.shelf++;
    if (prediction.class == "aircon") set.aircon++;
    if (prediction.class == "exhaust fan") set.exhaust++;
    if (prediction.class == "ventilation") set.ventilation++;
  });
}

async function cleanlinessDetection(image, shine) {
  let response = {
    predictions: [],
  };
  await axios({
    method: "POST",
    url: "https://detect.roboflow.com/classroom-yellow-seg/1",
    params: {
      api_key: "OeSBdrSNcfGEme3a9fDf",
    },
    data: image,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
    .then(function (res) {
      console.log("cleanliness detection >>> ", res.data);
      response = res.data;
    })
    .catch(function (error) {
      console.log(error.message);
    });
  response.predictions.forEach((prediction) => {
    console.log("clean prediction foreach", prediction);
    if (prediction.class == "adhesive") shine.adhesives++;
    if (prediction.class == "damage") shine.damage++;
    if (prediction.class == "dirt") shine.dirt++;
    if (prediction.class == "dust") shine.dust++;
    if (prediction.class == "litter") shine.litter++;
    if (prediction.class == "smudge") shine.smudge++;
    if (prediction.class == "stain") shine.stain++;
  });
}

// Define a function to check if a desk or chair is cluttered based on personal belongings
function isCluttered(dcObjects, pbObjects) {
  console.log("dcObjects [][][][", dcObjects);
  console.log("pbObjects [][][][", pbObjects);
  // Create an array to store clutteredness status for each object
  let clutteredStatus = [];

  if (pbObjects.length == 0) return clutteredStatus;

  // Iterate over each object in dcObjects
  dcObjects.forEach((dcObject) => {
    // Find the corresponding pbObject based on positions
    let pbObject = findCorrespondingPBObject(dcObject, pbObjects);

    let object = {
      class: dcObject.class,
      x: dcObject.x,
      y: dcObject.y,
      width: dcObject.width,
      height: dcObject.height,
      points: pbObject ? pbObject.points : [], // Use points if pbObject is found, otherwise empty array
      isClutter: false,
    };

    // Assuming object is the detected desk or chair
    // Count the number of personal belongings within the bounding box
    let numPersonalBelongings = 0;
    for (let i = 0; i < object.points.length; i++) {
      // Assuming each point represents the coordinates of a personal belonging
      // Check if the point is within the bounding box of the desk or chair
      let point = object.points[i];
      if (
        point.x >= object.x &&
        point.x <= object.x + object.width &&
        point.y >= object.y &&
        point.y <= object.y + object.height
      ) {
        numPersonalBelongings++;
      }
    }

    // Define a threshold for clutteredness (you can adjust this threshold based on your requirements)
    const clutterThreshold = 1; // For example, if there are more than 5 personal belongings, consider it cluttered

    // Check if the number of personal belongings exceeds the threshold
    if (numPersonalBelongings >= clutterThreshold) {
      object.isClutter = true;
    }
    clutteredStatus.push(object);
  });

  return clutteredStatus;
}

// Function to find corresponding pbObject based on positions
function findCorrespondingPBObject(dcObject, pbObjects) {
  // Iterate over pbObjects and find the one whose position is closest to dcObject
  let minDistance = Infinity;
  let closestPBObject = null;

  pbObjects.forEach((pbObject) => {
    // Calculate the distance between dcObject and pbObject (using the Euclidean distance)
    let distance = Math.sqrt(
      Math.pow(dcObject.x - pbObject.x, 2) +
        Math.pow(dcObject.y - pbObject.y, 2)
    );

    // Update closestPBObject if the distance is smaller
    if (distance < minDistance) {
      minDistance = distance;
      closestPBObject = pbObject;
    }
  });

  return closestPBObject;
}

async function computeScores(s3, isClutterResults) {
  const trashCanRecommendedNo = 3;
  const cabinetRecommendedNo = 1;
  const danglings = 0;

  const idealOrganization = 10;
  const idealAEV = 1;

  let clutterNo = isClutterResults.length;
  s3.sort.clutter = clutterNo;

  console.log("clutter numbers >>>>> ", clutterNo);

  let sort = s3.sort;
  let set = s3.set;
  let shine = s3.shine;

  //sort score
  const cabinetScore = Math.min(sort.cabinet, cabinetRecommendedNo) * 1;
  const clutterScore = (sort.clutter === 0 ? 1 : 0) * 2;
  const danglingsScore = (sort.danglings === danglings ? 1 : 0) * 6;
  const wasteDisposalScore =
    Math.min(sort.wasteDisposal, trashCanRecommendedNo) * 1;

  const sortScore =
    ((cabinetScore + clutterScore + danglingsScore + wasteDisposalScore) / 10) *
    10;

  //set score
  const organizationScore = (set.organization / idealOrganization) * 6;
  const atLeastOneHVACScore =
    (set.aircon + set.exhaust + set.ventilation >= idealAEV ? 1 : 0) * 4;

  const setScore = ((organizationScore + atLeastOneHVACScore) / 10) * 10;

  //shine score

  const totalCount = Object.values(shine).reduce((total, c) => total + c, 0);
  const maxCount = Math.max(...Object.values(shine));

  // Handle case where totalCount is 0 to avoid division by zero
  const shineScore =
    totalCount === 0
      ? 0
      : (totalCount / (maxCount * Object.keys(shine).length)) * 10;

  s3.sort.score = sortScore;
  s3.set.score = setScore;
  s3.shine.score = shineScore;

  return s3;
}

async function evaluate(images) {
  // Create an array to store promises for each request
  const requests = [];

  const s3Results = [];

  // Loop through the images array
  for (let index = 0; index < images[0].length; index++) {
    let sort = { ...SORT };
    let set = { ...SET };
    let shine = { ...SHINE };

    const image = images[0][index];
    // const delay = index * 2000;

    console.log("index {}{}{}{}{}{}", index);

    // Wait for the delay
    // await new Promise((resolve) => setTimeout(resolve, delay));

    // Send the request and store the promise in the requests array
    const count = await countDesksChairs(image);
    if (count.count >= 10) {
      await organizationCheck(image, set);
    }
    await blueDetection(image, sort, set);
    const pb_result = await personalBelongingsCheck(image);
    const ic_result = isCluttered(count.data.predictions, pb_result);
    await cleanlinessDetection(image, shine);
    let s3 = {
      sort: sort,
      set: set,
      shine: shine,
    };
    const s3Result = await computeScores(s3, ic_result);
    s3Results.push(s3Result);
  }
  console.log("srResultsssss >>>>> ", s3Results);
  // Return a promise that resolves when all requests are complete
  return s3Results;
}

export default evaluate;
