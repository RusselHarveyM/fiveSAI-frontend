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
  const [raw5s, setRaw5s] = useState(null);

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

  const onScoreHandler = useCallback(
    async (raw5s) => {
      console.log("raw5s >>>{{{{", raw5s);

      setRaw5s(raw5s); // update raw5s state

      const { sort, set, shine } = raw5s.comment;
      const { score: sortScore } = raw5s.result.sort;
      const { score: setScore } = raw5s.result.set;
      const { score: shineScore } = raw5s.result.shine;

      const newRate = {
        id: "",
        sort: sortScore,
        setInOrder: setScore,
        shine: shineScore,
        standarize: 0,
        sustain: 0,
        security: 0,
        isActive: true,
        spaceId: spaceId,
      };

      console.log("space >>>{{{{", space);

      try {
        let ratingId = "";
        let commentId = "";

        if (
          (space[0].scores?.length == 0 && space[0].comments?.length == 0) ||
          (space[0]?.scores == undefined && space[0]?.comments == undefined)
        ) {
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
        } else {
          const spaceTemp = space.filter((sp) => sp.id === spaceId);

          console.log("space 22222 >>>> ", spaceTemp);

          const rateId = spaceTemp[0]?.scores?.id;

          newRate.id = rateId;

          console.log("newRate >>>> ", newRate);
          console.log("spaceId [][][][][]>>>> ", spaceId);

          const resRate = await axios.put(
            `https://fivesai-backend-production.up.railway.app/api/ratings/${rateId}`,
            newRate
          );

          ratingId = resRate.data;
          commentId = space[0]?.comments?.id;

          const newComment = {
            id: commentId,
            sort: sort,
            setInOrder: set,
            shine: shine,
            standarize: "",
            sustain: "",
            security: "",
            isActive: true,
            ratingId,
          };

          await axios.put(
            `https://fivesai-backend-production.up.railway.app/api/comment/${commentId}`,
            newComment
          );
        }
      } catch (error) {
        console.error(error);
      }
    },
    [space, spaceId, raw5s]
  );

  const populateSpaceRating = async () => {
    try {
      const response = await axios.get(
        "https://fivesai-backend-production.up.railway.app/api/ratings"
      );
      const ratings = response.data;
      const spaceRatings = ratings.map((rating) => ({
        id: rating.spaceId,
        rating:
          (Math.round((rating.sort + rating.setInOrder + rating.shine) / 3) *
            10) /
          10,
      }));

      setSpaceRating(spaceRatings);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    populateSpaceRating();
  }, [spaceId]);

  useEffect(() => {
    // Calculate the overall rating whenever spaceRating changes
    const overallRating =
      Math.round(
        (spaceRating.reduce((acc, curr) => acc + curr.rating, 0) /
          spaceRating.length) *
          10
      ) / 10;
    setOverallRating(overallRating);
  }, [spaceRating]);

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const response = await axios.get(
          `https://fivesai-backend-production.up.railway.app/api/rooms/${params.roomId}/room`
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
          response = await axios.get(
            `https://fivesai-backend-production.up.railway.app/api/ratings`
          );
          resComment = await axios.get(
            `https://fivesai-backend-production.up.railway.app/api/comment`
          );
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

  console.log("space rating >>>> ", spaceRating);

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
        <Accordion space={space.filter((s) => s.id === spaceId)} />
      </div>
      <div className={classes.roomContainer_redTags}></div>
    </div>
  );
};

export default Room;
