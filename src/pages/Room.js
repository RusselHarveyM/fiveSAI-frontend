import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import Card from "../components/UI/Card/Card";
import classes from "../components/rooms/room/Room.module.css";
import SpaceNavContent from "../components/rooms/room/SpaceNavContent";
import Accordion from "../components/UI/Accordion/Accordion";

import evaluateTwo from "../components/rooms/room/evaluateTwo";

import { ClipLoader } from "react-spinners";
import { parse } from "date-fns";

const Room = () => {
  const [roomData, setRoomData] = useState();
  const [spaces, setSpaces] = useState([]);
  const [space, setSpace] = useState([]);
  const [spaceId, setSpaceId] = useState();
  const [overallRating, setOverallRating] = useState(0.0);
  const [spaceRating, setSpaceRating] = useState([]);
  const [remark, setRemark] = useState("NOT CALIBRATED");
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRateRefresh, setIsRateRefresh] = useState(false);

  console.log("space >>>{{{{", space);

  useEffect(() => {
    if (overallRating >= 1 && overallRating <= 4) {
      setRemark("Bad");
    } else if (overallRating >= 4.1 && overallRating <= 7) {
      setRemark("Good");
    } else if (overallRating >= 7.1 && overallRating <= 10) {
      setRemark("Excellent");
    }
  }, [overallRating]);

  const params = useParams();

  const onScoreHandler = async (raw5s) => {
    console.log("raw5s >>>{{{{", raw5s);

    const { sort, set, shine } = raw5s.comment;
    const { score: sortScore } = raw5s.result.sort;
    const { score: setScore } = raw5s.result.set;
    const { score: shineScore } = raw5s.result.shine;

    const sortScoreFixed = parseFloat(sortScore.toFixed(1));
    const setScoreFixed = parseFloat(setScore.toFixed(1));
    const shineScoreFixed = parseFloat(shineScore.toFixed(1));

    console.log(" III data III", data);

    const totalScore = data.scores?.reduce(
      (acc, score) => acc + (score.sort + score.setInOrder + score.shine) / 3,
      0
    );

    let averageScore = totalScore / data.scores?.length;
    averageScore = Math.min(Math.max(averageScore, 1), 10);

    const sustainScoreFixed = parseFloat(averageScore.toFixed(1));

    const newRate = {
      id: "",
      sort: sortScoreFixed,
      setInOrder: setScoreFixed,
      shine: shineScoreFixed,
      standarize: 0,
      sustain: sustainScoreFixed,
      security: 0,
      isActive: true,
      spaceId: space.id,
    };

    try {
      let ratingId = "";
      console.log(newRate, "newRate");
      const resRate = await axios.post(
        "https://fivesai-backend-production.up.railway.app/api/ratings",
        newRate
      );

      console.log("resRate data >>>> ", resRate.data);
      ratingId = resRate.data;

      const newComment = {
        id: "",
        sort: sort,
        setInOrder: set,
        shine: shine,
        standarize: "",
        sustain: "",
        security: "",
        isActive: true,
        ratingId,
      };

      const resComment = await axios.post(
        "https://fivesai-backend-production.up.railway.app/api/comment",
        newComment
      );

      let newRateTemp = newRate;
      newRateTemp.id = ratingId;

      let newCommentTemp = newComment;
      newCommentTemp.id = resComment.data;

      let newData = {
        scores: newRateTemp,
        comments: newCommentTemp,
      };

      // Update state with the new data
      setData(newData);
    } catch (error) {
      console.error(error);
    }
    setIsRateRefresh((prev) => !prev);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(() => true);
        const roomData = await axios.get(
          `https://fivesai-backend-production.up.railway.app/api/rooms/${params.roomId}/room`
        );
        setRoomData(() => roomData.data);
        const response = await axios.get(
          `https://fivesai-backend-production.up.railway.app/api/ratings`
        );
        const resComment = await axios.get(
          `https://fivesai-backend-production.up.railway.app/api/comment`
        );

        console.log("response response", response.data);
        let newData = {
          scores: response.data,
          comments: resComment.data,
        };

        const latestSpaceRatings = response?.data
          .sort((a, b) => new Date(b.dateModified) - new Date(a.dateModified)) // Sort by dateModified in descending order
          .filter(
            (rating, index, self) =>
              index === self.findIndex((r) => r.spaceId === rating.spaceId) // Filter out the first occurrence of each spaceId
          );

        console.log("latestSpaceRatings response", latestSpaceRatings);

        const spaceRatings = latestSpaceRatings.map((rating) => ({
          id: rating.spaceId,
          rating:
            (Math.round(
              (rating.sort +
                rating.setInOrder +
                rating.shine +
                rating.sustain) /
                4
            ) *
              10) /
            10,
        }));
        console.log("spaceRatings response", spaceRatings);

        setSpaceRating(() => spaceRatings);
        setData(() => ({ ...newData }));
      } catch (error) {
        console.log(error);
        const newRate = {
          id: "",
          sort: 0,
          setInOrder: 0,
          shine: 0,
          standarize: 0,
          sustain: 0,
          security: 0,
          isActive: true,
          spaceId: "",
        };

        const newComment = {
          id: "",
          sort: "",
          setInOrder: "",
          shine: "",
          standarize: "",
          sustain: "",
          security: "",
          isActive: true,
          ratingId: "",
        };

        let newData = {
          scores: newRate,
          comments: newComment,
        };
        setData(() => ({ ...newData }));
      } finally {
        setIsLoading(() => false);
      }
    };

    fetchData();
  }, [isRateRefresh]);

  useEffect(() => {
    // Calculate the overall rating whenever spaceRating changes
    const roomSpaceRatings = spaceRating.filter(
      (rating) =>
        spaces.find((space) => space.id === rating.id)?.roomId === params.roomId
    );
    const overallRating =
      Math.round(
        (roomSpaceRatings.reduce((acc, curr) => acc + curr.rating, 0) /
          roomSpaceRatings.length) *
          10
      ) / 10;
    setOverallRating(() => (overallRating ? overallRating : 0));
  }, [spaceRating, isRateRefresh]);

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const response = await axios.get(
          `https://fivesai-backend-production.up.railway.app/api/space`
        );
        setSpaces(() => {
          return response.data.filter((space) => space.roomId === roomData?.id);
        });
      } catch (error) {
        console.log(error);
      }
    };
    fetchSpaces();
  }, [roomData?.id]);

  const handleBackButtonClick = () => {
    window.history.back();
  };

  useEffect(() => {
    const updateSpace = async () => {
      if (spaceId === undefined) {
        console.log("No space found with the given id");
        return;
      }

      let score = "";
      let comment = "";
      let spaceRate = "";
      let newSpace = "";
      let filteredSpace = "";

      console.log(":::data:::", data);

      const getScoreAndComment = (data, scoreId) => {
        const score = data?.scores
          ?.filter((score) => score.spaceId == scoreId)
          ?.sort((a, b) => new Date(b.dateModified) - new Date(a.dateModified))
          ?.slice(0, 1);
        console.log(">>>score [][] <<<", score);

        const comment = data?.comments
          ?.filter((comment) => comment.ratingId == score[0]?.id)
          ?.sort((a, b) => new Date(b.dateModified) - new Date(a.dateModified))
          ?.slice(0, 1);

        return { score, comment };
      };

      const calculateSpaceRate = (score) => {
        return (
          (Math.round((score?.sort + score?.setInOrder + score?.shine) / 3) *
            10) /
          10
        );
      };
      console.log(">>>data.length <<<", data);

      if (data?.scores?.length > 0) {
        const { score, comment } = getScoreAndComment(data, spaceId);
        console.log(">>>score <<<", score);
        const spaceRate = calculateSpaceRate(score[0]);
        filteredSpace = spaces.filter((sp) => sp.id == spaceId);

        newSpace = {
          id: spaceId,
          name: filteredSpace[0].name,
          score: score[0] ? score[0] : score,
          rating: spaceRate ? spaceRate : 0,
          comments: comment[0] ? comment[0] : comment,
        };
      } else {
        const score = data.scores;
        const comment = data.comments;
        const spaceRate = calculateSpaceRate(score);
        console.log(">>>score2<<<", score);

        filteredSpace = spaces.filter((sp) => sp.id == spaceId);

        newSpace = {
          id: spaceId,
          name: filteredSpace[0].name,
          score: score[0] ? score[0] : score,
          rating: spaceRate ? spaceRate : 0,
          comments: comment[0] ? comment[0] : comment,
        };
      }

      setSpace(() => ({ ...newSpace }));
    };

    try {
      updateSpace();
    } catch (error) {
      console.log(error);
    }
  }, [spaceId, isRateRefresh]);

  const onSpaceNavHandler = (res) => {
    setSpaceId(res.target.id);
  };

  return (
    <div className={classes.roomContainer}>
      <Card className={classes.roomContainer_header}>
        <button
          onClick={handleBackButtonClick}
          className={classes.backButton}
        ></button>
        <img
          src={`data:image/png;base64,${roomData?.image}`}
          alt="room preview"
        />
        <h1>{roomData?.roomNumber}</h1>
      </Card>
      <div className={classes.roomContainer_spaces}>
        <Card className={classes.spaceNavigation}>
          <h2>Spaces</h2>
          <div className={classes.spaceNavigation_list}>
            {spaces?.map((space) => (
              <button key={space.id} id={space.id} onClick={onSpaceNavHandler}>
                {space.name}
              </button>
            ))}
          </div>
        </Card>
        <SpaceNavContent
          onData={space.score}
          onName={space.name}
          onScoreHandler={onScoreHandler}
          spaceRate={space.rating}
          spaceId={spaceId}
        />
      </div>
      <div className={classes.roomContainer_ratings}>
        <div
          className={`${classes.roomContainer_ratings_rating} ${
            remark === "Bad"
              ? classes.red
              : remark === "Good"
              ? classes.yellow
              : classes.green
          }`}
        >
          <h1>{overallRating}</h1>
          <h3>{remark}</h3>
        </div>
        <h1>5S+ Rating</h1>
        <Accordion onData={space} />
      </div>
      <div className={classes.roomContainer_redTags}></div>
      <div className={classes.roomLoader}>
        <ClipLoader color="#731c23" loading={isLoading} size={20} />
      </div>
    </div>
  );
};

export default Room;
