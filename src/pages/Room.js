import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import Card from "../components/UI/Card/Card";
import classes from "../components/rooms/room/Room.module.css";
import SpaceNavContent from "../components/rooms/room/SpaceNavContent";
import Accordion from "../components/UI/Accordion/Accordion";

const Room = () => {
  const [roomData, setRoomData] = useState();
  const [spaces, setSpaces] = useState([]);
  const [space, setSpace] = useState([]);
  const [spaceId, setSpaceId] = useState();
  const [overallRating, setOverallRating] = useState(0.0);
  const [spaceRating, setSpaceRating] = useState([]);
  const [remark, setRemark] = useState("NOT CALIBRATED");
  const [isRefreshSNContent, setIsRefreshSNContent] = useState(false); // for refreshing SpaceNavContent.js
  const [rate, setRate] = useState({});

  const params = useParams();

  useEffect(() => {
    setOverallRating(() => {
      let totalScore = 0;
      spaceRating?.forEach((current) => {
        totalScore += current.rating;
      });
      console.log("current spaceRating >>>.", spaceRating);
      return (totalScore / spaceRating.length).toPrecision(2);
    });
  }, [spaceRating]);

  const onScoreHandler = useCallback(
    async (raw5s) => {
      let newRate = {
        id: "",
        sort: 0,
        setInOrder: 0,
        shine: 0,
        standarize: 0,
        sustain: 0,
        security: 0,
        isActive: true,
        spaceId: spaceId,
      };

      raw5s.forEach((s3) => {
        newRate.sort += s3.sort.score;
        newRate.setInOrder += s3.set.score;
        newRate.shine += s3.shine.score;
      });
      newRate.sort = Math.round((newRate.sort / raw5s.length) * 10) / 10;
      newRate.setInOrder =
        Math.round((newRate.setInOrder / raw5s.length) * 10) / 10;
      newRate.shine = Math.round((newRate.shine / raw5s.length) * 10) / 10;

      setRate(newRate);

      const createNewComment = (ratingId) => ({
        id: "",
        sort: "",
        setInOrder: "",
        shine: "",
        standarize: "",
        sustain: "",
        security: "",
        isActive: true,
        ratingId,
      });

      console.log("space >>>{{{{", space);

      if (space[0].scores?.length == 0 && space[0].comments?.length == 0) {
        try {
          const resRate = await axios.post(
            "https://fivesai-backend/api/ratings",
            newRate
          );

          console.log("resRate data >>>> ", resRate.data);

          const newComment = createNewComment(resRate.data);

          const resComment = await axios.post(
            "https://fivesai-backend/api/comment",
            newComment
          );
        } catch (error) {
          console.error(error);
        }
      } else {
        try {
          const resRate = await axios.put(
            `https://fivesai-backend/api/ratings/${space[0].scores?.id}`,
            newRate
          );

          const newComment = createNewComment(resRate.data);
          const resComment = await axios.put(
            `https://fivesai-backend/api/comment/${space[0].scores?.id}`,
            newComment
          );
        } catch (error) {
          console.error(error);
        }
      }
      setIsRefreshSNContent((prevState) => !prevState);
    },
    [space, spaceId]
  );

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const response = await axios.get(
          `https://fivesai-backend/api/rooms/${params.roomId}/room`
        );
        setRoomData(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchRoomData();
  }, [params.roomId]);

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const response = await axios.get(`https://fivesai-backend/api/space`);
        console.log("reponse >>>", response);
        console.log("roomData>>>", roomData);
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
      for (const space of spaces) {
        console.log("im in ");
        console.log("im in space", space);
        if (space.length === 0) {
          console.log("No space found with the given id");
          return;
        }
        var response;
        var resComment;
        try {
          response = await axios.get(`https://fivesai-backend/api/ratings`);
          resComment = await axios.get(`https://fivesai-backend/api/comment`);
        } catch (error) {
          console.log(error);
        }

        console.log("p1[", response);
        console.log("space.id[", spaceId);

        const scores = response?.data?.filter(
          (score) => score.spaceId == spaceId
        );

        console.log("p1[ scores ]]] ", scores);

        const comments = resComment?.data?.filter(
          (comment) =>
            comment.ratingId == (scores.length > 0 ? scores[0].id : null)
        );

        if (scores.length > 0) {
          const properties = [
            "security",
            "setInOrder",
            "shine",
            "sort",
            "standarize",
            "sustain",
          ];
          let totalScores = 0;

          properties.forEach((property) => {
            totalScores += scores[0][property];
          });

          let score = totalScores / 3;
          let roundedScore = Math.round(score * 10) / 10;

          console.log("tt score", roundedScore);

          setSpaceRating((prevRatings) => [
            ...prevRatings,
            { id: space.id, rating: roundedScore },
          ]);
        } else {
          console.log("fail");
          setSpaceRating((prevRatings) => [
            ...prevRatings,
            { id: space.id, rating: 0 },
          ]);
        }

        setSpace((prevSpace) => {
          const newSpace = prevSpace.filter((sp) => sp.id !== space.id);
          console.log("sp spsp >>> ", newSpace);
          console.log("sp prevSpace >>> ", prevSpace);
          return [
            ...newSpace,
            {
              id: space.id,
              space: space,
              scores: scores ? scores[0] : [],
              comments: comments ? comments[0] : [],
            },
          ];
        });
      }
    };

    try {
      updateSpace();
    } catch (error) {
      console.log(error);
    }
  }, [spaceId]);

  const onSpaceNavHandler = useCallback(async (res) => {
    setSpaceId(res.target.id);
  }, []);

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
          onData={space.filter((s) => s.id === spaceId)}
          onScoreHandler={onScoreHandler}
          spaceRate={spaceRating.filter((rating) => rating.id === spaceId)}
          // overallScore={onSetTotalScoreHandler}
        />
      </div>
      <div className={classes.roomContainer_ratings}>
        <div className={classes.roomContainer_ratings_rating}>
          <h1>{overallRating}</h1>
          <h3>{remark}</h3>
        </div>
        <h1>5S+ Rating</h1>
        <Accordion space={space.filter((s) => s.id === spaceId)} />
      </div>
      <div className={classes.roomContainer_redTags}></div>
    </div>
  );
};

export default Room;
