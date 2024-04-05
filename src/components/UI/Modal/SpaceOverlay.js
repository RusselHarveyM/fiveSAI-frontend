import Card from "../Card/Card";
import classes from "./Overlay.module.css";
import Button from "../Button/Button";
import { useState, useCallback, useEffect } from "react";
import axios from "axios";

const Overlay = (props) => {
  const {
    status,
    data,
    imageData,
    spaceId,
    onUpdate,
    onAddImage,
    onConfirm,
    onDelete,
    onCreate,
  } = props;
  const { name = "", roomId = "" } = data || {};
  const [selectedFile, setSelectedFile] = useState(null);
  const [rooms, setRooms] = useState([]);

  const handleFileChange = useCallback((event) => {
    setSelectedFile(event.target.files[0]);
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        await axios
          .get(`https://fs-backend-copy-production.up.railway.app/api/rooms`)
          .then((data) => {
            setRooms(data.data);
          });
      } catch (error) {
        console.log(error);
      }
    };
    fetchRooms();
  }, []);

  const onEditHandler = (event) => {
    event.preventDefault();
    const data = {
      Id: spaceId,
      name: event.target[0].value,
      roomId: event.target[1].value,
    };
    onUpdate(data.id, data);
    onConfirm();
  };

  const onDeleteHandler = () => {
    onDelete(data.id);
    onConfirm();
  };

  const onAddImageHandler = async () => {
    if (!selectedFile) {
      throw new Error("File field is required.");
    }
    onAddImage(data.id, selectedFile);
    onConfirm();
  };

  const onAddHandler = useCallback(
    (event) => {
      event.preventDefault();
      console.log("room id >>>> ", event.target[1].value);
      const data = {
        Id: "",
        name: event.target[0].value,
        roomId: event.target[1].value,
        pictures: [
          {
            Id: "",
            spaceId: "",
            image: null,
          },
        ],
      };
      onCreate(data);
      onConfirm();
    },
    [selectedFile]
  );

  if (status === "edit") {
    return (
      <Card className={classes.editOverlay}>
        <form onSubmit={onEditHandler} className={classes.editForm}>
          <label>Space Name</label>
          <input
            className={classes.search}
            type="text"
            id="spaceName"
            defaultValue={name}
          />
          <label>Room Id</label>
          <select className={classes.select} id="roomId">
            {rooms?.map((room) => (
              <option value={room.id}>{room.roomNumber}</option>
            ))}
          </select>
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
          <label>Space Name</label>
          <input className={classes.search} type="text" id="spaceName" />
          <label>Room Id</label>
          <select className={classes.select} id="roomId">
            {rooms?.map((room) => (
              <option value={room.id}>{room.roomNumber}</option>
            ))}
          </select>
          <Button type="submit" className={classes.addBtn}>
            Add Space
          </Button>
        </form>
      </Card>
    );
  }
  if (status === "image") {
    return (
      <Card className={classes.editOverlay}>
        <div className={classes.editForm}>
          <label>Space Images</label>
          <div className={classes.spaceImageContainer}>
            {imageData?.data?.map((data) => (
              <img
                key={data.id}
                id="image"
                src={`data:image/png;base64,${data.image}`}
                alt="space preview"
                className={classes.spaceImage}
              />
            ))}
          </div>

          <input
            type="file"
            name="file"
            id="imageUpload"
            accept="image/png, image/jpeg"
            onChange={handleFileChange}
          />

          <Button onClick={onAddImageHandler} className={classes.addBtn}>
            Add Image
          </Button>
        </div>
      </Card>
    );
  }
};

export default Overlay;
