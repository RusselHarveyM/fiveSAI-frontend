import React, { useCallback, useState, useMemo } from "react";
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
  const [deletedData, setDeletedData] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  console.log("spaceData >>> ", spaceData);

  const onEvaluateHandler = useCallback(async () => {
    setIsLoading(true);
    const images = [
      data.map((space) => "data:image/png;base64," + space.image),
    ];

    const result = await evaluate(images);
    scoreHandler(result);
    onConfirm();
    setIsLoading(false);
  }, [data, scoreHandler]);

  const onEditHandler = useCallback(() => {
    setDeletedData([]);
    setSelectedImages([]);
    setIsEdit((prevIsEdit) => !prevIsEdit);
    setIsDelete(false);
  }, []);

  const onConfirmHandler = useCallback(() => {
    spaceDataHandler(
      deletedData.length > 0 ? deletedData : [],
      selectedImages.length > 0 ? selectedImages : [],
      isDelete
    );
    setIsEdit((prevIsEdit) => !prevIsEdit);
  }, [deletedData, selectedImages, isDelete, spaceDataHandler]);

  const handleFileChange = useCallback((event) => {
    const files = Array.from(event.target.files);
    setSelectedImages(files);
  }, []);

  const onDeleteImageHandler = useCallback(
    (event) => {
      const delData = data.filter((image) => image.id === event.target.id);
      setDeletedData((prevData) => [...prevData, ...delData]);
      setData((prevData) =>
        prevData.filter((image) => image.id !== event.target.id)
      );
      setIsDelete(true);
    },
    [data]
  );

  const onCancelButtonHandler = useCallback(() => {
    setData(spaceData);
    setDeletedData([]);
    setIsDelete(false);
    setIsEdit((prevIsEdit) => !prevIsEdit);
    onConfirm();
  }, [spaceData, onConfirm]);

  const renderImages = useMemo(
    () =>
      data.map((image) => (
        <div key={image.id}>
          <img
            className={classes.image}
            src={`data:image/png;base64,${image.image}`}
            alt={image.name}
          />
          {isEdit && (
            <button
              id={image.id}
              className={classes.deleteImageBtn}
              onClick={onDeleteImageHandler}
            >
              X
            </button>
          )}
        </div>
      )),
    [data, isEdit, onDeleteImageHandler]
  );

  return (
    <div className={classes.container}>
      <div className={classes.container_header}>
        <h2>Images</h2>
      </div>
      {isLoading ? (
        // If loading, render the spinner
        <ClipLoader color="#000" loading={isLoading} size={150} />
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
