import axios from "axios";

const API_KEY = "aGGzTIu56n8TOSWVfudS";

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
  chairs: 0,
  desks: 0,
  disorganizedRow: 0,
  organizedRow: 0,
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
      api_key: API_KEY,
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
  await axios({
    method: "POST",
    url: "https://detect.roboflow.com/classroom-order-seg/9",
    params: {
      api_key: API_KEY,
    },
    data: image,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
    .then(function (res) {
      console.log("organize check >>>", res.data);
      res.data.predictions.map((prediction) => {
        if (prediction.class === "disorganized") set.disorganizedRow++;
        if (prediction.class === "organized") set.organizedRow++;
      });
    })
    .catch(function (error) {
      console.log(error.message);
    });
  // results.disorganized = [
  //   response?.predictions?.map((pred) => pred.class == "disorganized"),
  // ];
  // results.organized = [
  //   response?.predictions?.map((pred) => pred.class == "organized"),
  // ];

  let overall = set.organizedRow + set.disorganizedRow;
  set.organization = (set.organizedRow / overall) * 10;
  // set.organizedRow = results.organized.length;
  // set.disorganizedRow = results.disorganized.length;
}

async function personalBelongingsCheck(image) {
  let response = {
    predictions: [],
  };
  await axios({
    method: "POST",
    url: "https://detect.roboflow.com/classroom-3igmn/7",
    params: {
      api_key: API_KEY,
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
      api_key: API_KEY,
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
      api_key: API_KEY,
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

    // Calculate the center of the bounding box
    const centerX = object.x + object.width / 2;
    const centerY = object.y + object.height / 2;

    // Calculate the half of the diagonal of the bounding box
    const halfDiagonal =
      Math.sqrt(Math.pow(object.width, 2) + Math.pow(object.height, 2)) / 2;

    // Count the number of personal belongings within the bounding box
    let numPersonalBelongings = 0;
    for (let i = 0; i < object.points.length; i++) {
      // Calculate the Euclidean distance between the center of the bounding box and the point
      let point = object.points[i];
      const distance = Math.sqrt(
        Math.pow(point.x - centerX, 2) + Math.pow(point.y - centerY, 2)
      );

      // Check if the distance is less than or equal to the half of the diagonal
      if (distance <= halfDiagonal) {
        numPersonalBelongings++;
      }
    }

    // Define a threshold for clutteredness (you can adjust this threshold based on your requirements)
    const clutterThreshold = 1; // For example, if there are more than 2 personal belongings, consider it cluttered

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
  // const organizationScore = (set.organization / idealOrganization) * 8;
  const atLeastOneHVACScore =
    (set.aircon + set.exhaust + set.ventilation >= idealAEV ? 1 : 0) * 2;

  const setScore = Math.max(
    ((set.organization + atLeastOneHVACScore) / 10) * 10,
    1
  );

  // shine score
  // const totalCount = Object.values(shine).reduce((total, c) => total + c, 0);
  // const maxCount = Math.max(...Object.values(shine));

  // Calculate the score based on the distance from zero
  const shineScore = Object.values(shine).reduce(
    (total, c) => total + (c === "damage" ? -10 : 1 - c),
    0
  );
  const normalizedShineScore = shineScore / (Object.keys(shine).length + 1);
  const scaledShineScore = normalizedShineScore * 10;

  // Normalize the score to be between 0 and 1

  // Scale the score to be between 1 and 10

  s3.sort.score = sortScore;
  s3.set.score = setScore;
  s3.shine.score = scaledShineScore >= 0 ? scaledShineScore : 0;

  return s3;
}

async function evaluate(images) {
  const s3Results = [];

  let overalls3 = {
    sort: { ...SORT },
    set: { ...SET },
    shine: { ...SHINE },
  };

  let organizationCountImage = 0;
  let length = images[0].length;

  // let organizeScore = 0;

  // Loop through the images array
  for (let index = 0; index < length; index++) {
    let sort = { ...SORT };
    let set = { ...SET };
    let shine = { ...SHINE };

    const image = images[0][index];

    const count = await countDesksChairs(image);
    const predictions = count.data.predictions;
    console.log("count {}{}{}{}{}{}", count);
    predictions.map((prediction) => {
      console.log("prediction.class >>>> ", prediction.class);
      if (prediction.class == "desk") set.desks++;
      if (prediction.class == "chair") set.chairs++;
    });

    if (count.count >= 10) {
      await organizationCheck(image, set);
      // organizeScore += set.organization;
      organizationCountImage++;
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
    // Calculate overall scores and add them to overalls3
    for (let prop in sort) {
      overalls3.sort[prop] += sort[prop];
    }
    for (let prop in set) {
      overalls3.set[prop] += set[prop];
    }
    for (let prop in shine) {
      overalls3.shine[prop] += shine[prop];
    }
  }
  overalls3.sort.score /= length;
  overalls3.sort.clutter /= length;

  overalls3.set.score /= length;
  overalls3.set.organization /=
    organizationCountImage !== 0 ? organizationCountImage : 0;

  overalls3.shine.score /= length;

  let comments = {
    sort: "",
    set: "",
    shine: "",
  };

  let overallS3Copy = { ...overalls3 };

  for (let prop in overallS3Copy) {
    for (let subProp in overallS3Copy[prop]) {
      if (subProp !== "score" && subProp !== "organization") {
        comments[prop] += `\n• ${subProp}: ${overallS3Copy[prop][subProp]};`;
      }
    }
    if (prop === "sort")
      comments[
        prop
      ] += `\n\n To achieve a high score in ${prop}, please make sure that the area is clutter-free.`;
    if (prop === "set")
      comments[
        prop
      ] += `\n\n To achieve a high score in ${prop}, desks and chairs should be properly organized.`;
    if (prop === "shine")
      comments[
        prop
      ] += `\n\n To achieve a high score in ${prop}, Aim for a score of 0 for each criteria listed.`;
  }

  console.log("comments >>>>> ", comments);

  console.log("srResultsssss >>>>> ", s3Results);
  return {
    result: overalls3,
    comment: comments,
    // standardize: organizeScore / length,
  };
}

export default evaluate;
