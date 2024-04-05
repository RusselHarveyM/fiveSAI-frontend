import React, { useState, useEffect, useCallback } from "react";
import ReactDom from "react-dom";
import classes from "./SpaceNavContent.module.css";
import Card from "../../UI/Card/Card";
import axios from "axios";

import Backdrop from "../../UI/Modal/BackdropModal.js";
import ViewImageOverlay from "../../UI/Modal/ViewImageOverlay.js";
import ScoreCard from "./ScoreCard.js";

import { ClipLoader } from "react-spinners";

const apiBaseUrl =
  "https://fs-backend-copy-production.up.railway.app/api/spaceimage";

const SpaceNavContent = ({
  onData,
  onScoreHandler,
  spaceRate,
  spaceId,
  onName,
}) => {
  const [spaceTotalScore, setSpaceTotalScore] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefresh, setIsRefresh] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [spaceData, setSpaceData] = useState(undefined);

  useEffect(() => {
    if (spaceId === undefined) return;
    setIsLoading(() => false);
  }, [spaceData]);

  const fetchSpaceData = useCallback(async (id) => {
    try {
      const response = await axios.get(`${apiBaseUrl}/get/${id}`);
      console.log("space image data :::::", response.data);
      return response.data;
    } catch (error) {
      console.log(error);
      return [];
    }
  }, []);

  const deleteSpaceData = async (data) => {
    try {
      console.log("data > ", data);
      await axios.delete(`${apiBaseUrl}/delete/${data.id}`);
      setIsRefresh((prev) => !prev);
    } catch (error) {
      console.log(error);
    }
  };

  const uploadSpaceData = async (id, image) => {
    try {
      const formData = new FormData();
      formData.append("file", image);
      console.log("id 111", id);
      await axios.post(`${apiBaseUrl}/upload/${id}`, formData);
      console.log("uploading");
      setIsRefresh((prev) => !prev);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      console.log("onData id [][][]", onData);
      setIsLoading(() => true);
      const data = await fetchSpaceData(spaceId);
      console.log(data, "data");
      setIsLoading(() => false);
      setSpaceData(data);
    };
    if (spaceId !== undefined) fetchData();
  }, [isRefresh, spaceId]);

  const onSetNewSpaceDataHandler = async (data, selectedImages, isDelete) => {
    if (isDelete) {
      data?.map(deleteSpaceData);
    }
    console.log("onData", onData);
    selectedImages.map((image) => uploadSpaceData(spaceId, image));
  };

  const onViewImageHandler = useCallback(() => {
    setIsModalOpen(true);
  }, []);
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setIsRefresh(() => !isRefresh);
  }, []);

  return (
    <Card className={classes.spaceNavigation_content}>
      {isModalOpen && (
        <>
          {ReactDom.createPortal(
            <Backdrop onConfirm={closeModal} />,
            document.getElementById("backdrop-root")
          )}
          {ReactDom.createPortal(
            <ViewImageOverlay
              scoreHandler={onScoreHandler}
              onConfirm={closeModal}
              spaceData={spaceData?.filter((sd) => sd.spaceId !== "undefined")}
              spaceDataHandler={onSetNewSpaceDataHandler}
            />,
            document.getElementById("overlay-root")
          )}
        </>
      )}

      {isLoading ? (
        <div style={{ transform: "scale(3)" }}>
          {" "}
          {/* Increase the scale value to make the spinner thicker */}
          <ClipLoader color="#731c23" loading={isLoading} size={40} />
        </div>
      ) : (
        <>
          <header className={classes.spaceTitle}>
            <h2>
              {onName}
              <sup className={classes.spaceScore}>{spaceRate}/10</sup>
            </h2>
            <div className={classes.spaceTitle_buttons}>
              {spaceData !== undefined ? (
                <button onClick={onViewImageHandler}>View Images</button>
              ) : (
                <button disabled>View Images</button>
              )}
            </div>
          </header>
          <div className={classes.spaceBody}>
            {["sort", "setInOrder", "shine", "standarize", "sustain"].map(
              (title) => (
                <ScoreCard
                  key={title}
                  score={onData?.[title]}
                  totalScore={spaceTotalScore}
                  title={title.toUpperCase()}
                />
              )
            )}
          </div>
        </>
      )}
    </Card>
  );
};

export default SpaceNavContent;
