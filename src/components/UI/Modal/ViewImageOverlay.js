import React, { useCallback, useState } from "react";
import classes from "./ViewImageOverlay.module.css";
import evaluate from "../../rooms/room/evaluate";
import addImage from "../../../static/images/addImage.png";

import { ClipLoader } from "react-spinners";

const ViewImageOverlay = ({
  spaceData,
  scoreHandler,
  spaceDataHandler,
  onConfirm,
}) => {
  const [isEdit, setIsEdit] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [data, setData] = useState([...spaceData]);
  const [tempData] = useState(data);
  const [deletedData, setDeletedData] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // New state variable for tracking loading status

  const onEvaluateHandler = useCallback(async () => {
    const images = [
      data.map((space) => "data:image/png;base64," + space.image),
    ];

    const result = await evaluate(images);
    scoreHandler(result);
    onConfirm();
    setIsLoading(false);
  }, [data, scoreHandler]);

  const onEditHandler = () => {
    setDeletedData([]);
    setSelectedImages([]);
    setIsEdit(!isEdit);
    setIsDelete(false);
  };

  const onConfirmHandler = () => {
    spaceDataHandler(
      deletedData ? deletedData : [],
      selectedImages ? selectedImages : [],
      isDelete
    );
    setIsEdit(!isEdit);
    // onConfirm();
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedImages(files);
  };

  const onDeleteImageHandler = (event) => {
    console.log("delete event ???", event);
    const delData = data.filter((image) => image.id === event.target.id);
    console.log("delete event after???", delData);

    setDeletedData((prevData) => [...prevData, ...delData]);
    setData(() => data.filter((image) => image.id !== event.target.id));
    setIsDelete(true);
  };

  const onCancelButtonHandler = () => {
    setData(tempData);
    setDeletedData([]);
    setIsDelete(false);
    setIsEdit(!isEdit);
    onConfirm();
  };

  return (
    <div className={classes.container}>
      <div className={classes.container_header}>
        <h2>Images</h2>
      </div>
      {isLoading ? (
        // If loading, render the spinner
        <ClipLoader color="#ffffff" loading={isLoading} size={150} />
      ) : (
        <>
          <div className={classes.imageContainer}>
            {data?.map((image) => (
              <div key={image.id}>
                <img
                  className={classes.image}
                  src={`data:image/png;base64,${image.image}`}
                  alt={image.name}
                />
                {isEdit ? (
                  <button
                    id={image.id}
                    className={classes.deleteImageBtn}
                    onClick={onDeleteImageHandler}
                  >
                    X
                  </button>
                ) : (
                  ""
                )}
              </div>
            ))}
            {selectedImages.map((url, index) => (
              <img
                key={index}
                src={URL.createObjectURL(url)}
                alt="Selected"
                className={`${classes.image} ${isEdit ? classes.newImage : ""}`}
              />
            ))}
            {isEdit ? (
              <label htmlFor="imageUpload" className={classes.uploadImage}>
                <img src={addImage} alt="upload" />
                <input
                  type="file"
                  name="file"
                  id="imageUpload"
                  accept="image/png, image/jpeg"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  multiple
                />
              </label>
            ) : (
              ""
            )}
          </div>
          <div className={classes.buttonsContainer}>
            <button className={classes.evaluateBtn} onClick={onEvaluateHandler}>
              Evaluate
            </button>
            {isEdit ? (
              <div className={classes.editBtnContainer}>
                <button
                  className={classes.cancelBtn}
                  onClick={onCancelButtonHandler}
                >
                  Cancel
                </button>
                <button
                  className={classes.confirmBtn}
                  onClick={onConfirmHandler}
                >
                  Confirm
                </button>
              </div>
            ) : (
              <button className={classes.editBtn} onClick={onEditHandler}>
                Edit Images
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ViewImageOverlay;
