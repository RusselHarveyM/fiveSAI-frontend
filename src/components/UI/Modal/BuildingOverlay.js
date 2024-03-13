import Card from "../Card/Card";
import classes from "./Overlay.module.css";
import Button from "../Button/Button";
import { useState, useMemo } from "react";

const BuildingOverlay = (props) => {
  const { status, data, contentId, onUpdate, onConfirm, onDelete, onCreate } =
    props;
  const { buildingName = "", buildingCode = "" } = data || {};
  const [image, setImage] = useState(data?.image || null);
  const [newImage, setNewImage] = useState(null);

  const handleImageUpload = useMemo(
    () => (event) => {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        const base64Image = btoa(
          new Uint8Array(reader.result).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );

        setNewImage(base64Image);
        setImage(base64Image);
      };

      if (file) {
        reader.readAsArrayBuffer(file);
      }
    },
    []
  );

  const onEditHandler = (event) => {
    event.preventDefault();
    const data = {
      Id: contentId,
      buildingName: event.target[0].value,
      buildingCode: event.target[1].value,
      image: image,
    };
    onUpdate(contentId, data);
    onConfirm();
  };

  const onDeleteHandler = () => {
    onDelete(buildingName);
    onConfirm();
  };

  const onAddHandler = (event) => {
    event.preventDefault();
    const data = {
      Id: "",
      buildingName: event.target[0].value,
      buildingCode: event.target[1].value,
      image: newImage,
    };
    onCreate(data);
    onConfirm();
  };

  if (status === "edit") {
    return (
      <Card className={classes.editOverlay}>
        <form onSubmit={onEditHandler} className={classes.editForm}>
          <label>Building Name</label>
          <input
            className={classes.search}
            type="text"
            id="buildingName"
            defaultValue={buildingName}
          />
          <label>Building Code</label>
          <input
            className={classes.search}
            type="text"
            id="buildingCode"
            defaultValue={buildingCode}
          />
          <label>Building Image</label>
          <img
            id="image"
            className={classes.editPreview}
            defaultValue={image}
            src={`data:image/png;base64,${image}`}
            alt="Building preview"
          />
          <input
            type="file"
            accept="image/jpeg, image/png"
            onChange={handleImageUpload}
          />

          <Button type="submit" className={classes.editBtn}>
            Update
          </Button>
        </form>
      </Card>
    );
  }

  if (status === "delete") {
    return (
      <Card className={classes.deleteOverlay}>
        <h1>Are you sure?</h1>
        <Button onClick={onDeleteHandler}>Confirm</Button>
      </Card>
    );
  }

  if (status === "create") {
    return (
      <Card className={classes.editOverlay}>
        <form onSubmit={onAddHandler} className={classes.editForm}>
          <label>Building Name</label>
          <input className={classes.search} type="text" id="buildingName" />
          <label>Building Code</label>
          <input className={classes.search} type="text" id="buildingCode" />
          <label>Building Image</label>
          {newImage && (
            <img
              id="image"
              className={classes.editPreview}
              defaultValue={newImage}
              src={`data:image/png;base64,${newImage}`}
              alt="Building preview"
            />
          )}
          <input
            type="file"
            accept="image/jpeg, image/png"
            onChange={handleImageUpload}
          />
          <Button type="submit" className={classes.addBtn}>
            Add Building
          </Button>
        </form>
      </Card>
    );
  }
};

export default BuildingOverlay;
