import Card from "../Card/Card";
import classes from "./Overlay.module.css";
import Button from "../Button/Button";
import { useState, useMemo, useCallback, memo, useEffect } from "react";
import axios from "axios";

const Overlay = memo(
  ({ status, data, roomId, onUpdate, onConfirm, onDelete, onCreate }) => {
    const { buildingId = "", roomNumber = "" } = data || {};
    const [buildings, setBuildings] = useState([]);
    const [image, setImage] = useState(
      useMemo(() => data?.image || null, [data])
    );
    const [newImage, setNewImage] = useState(null);

    useEffect(() => {
      const fetchBuildings = async () => {
        try {
          await axios
            .get(
              `https://fivesai-backend-production.up.railway.app/api/buildings`
            )
            .then((data) => {
              setBuildings(data.data);
            });
        } catch (error) {
          console.log(error);
        }
      };
      fetchBuildings();
    }, []);

    const handleImageUpload = useCallback((event) => {
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
    }, []);

    const onEditHandler = useCallback(
      (event) => {
        event.preventDefault();
        const data = {
          Id: roomId,
          buildingId: event.target[0].value,
          roomNumber: event.target[1].value,
          status: event.target[2].value,
          image: image,
        };
        onUpdate(roomId, data);
        onConfirm();
      },
      [roomId, image, onUpdate, onConfirm]
    );

    const onDeleteHandler = useCallback(() => {
      onDelete(roomNumber);
      onConfirm();
    }, [roomNumber, onDelete, onConfirm]);

    const onAddHandler = useCallback(
      (event) => {
        event.preventDefault();
        const data = {
          Id: "",
          buildingId: event.target[0].value,
          roomNumber: event.target[1].value,
          status: event.target[2].value,
          image: newImage,
        };
        onCreate(data);
        onConfirm();
      },
      [newImage, onCreate, onConfirm]
    );

    if (status === "edit") {
      return (
        <Card className={classes.editOverlay}>
          <form onSubmit={onEditHandler} className={classes.editForm}>
            <label>Building Id</label>
            <select className={classes.select} id="buildingId">
              {buildings?.map((building) => (
                <option value={building.id}>{building.buildingCode}</option>
              ))}
            </select>

            <label>Name</label>
            <input
              className={classes.search}
              type="text"
              id="roomNumber"
              defaultValue={roomNumber}
            />
            <label>Status</label>
            <input
              className={classes.search}
              type="text"
              id="roomStatus"
              defaultValue={data.status}
            />
            <label>Room Image</label>
            <img
              id="image"
              className={classes.editPreview}
              defaultValue={image}
              src={`data:image/png;base64,${image}`}
              alt="Room preview"
            />
            <input
              type="file"
              accept="image/jpeg, image/png"
              onChange={handleImageUpload}
            />

            <Button type="submit" className={classes.editBtn}>
              Update Room
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
            <label>Building Id</label>
            <select className={classes.select} id="buildingId">
              {buildings?.map((building) => (
                <option kay={building.id} value={building.id}>
                  {building.buildingCode}
                </option>
              ))}
            </select>
            <label>Name</label>
            <input className={classes.search} type="text" id="roomNumber" />
            <label>Status</label>
            <input className={classes.search} type="text" id="roomStatus" />
            <label>Room Image</label>
            {newImage && (
              <img
                id="image"
                className={classes.editPreview}
                defaultValue={newImage}
                src={`data:image/png;base64,${newImage}`}
                alt="Room preview"
              />
            )}
            <input
              type="file"
              accept="image/jpeg, image/png"
              onChange={handleImageUpload}
            />
            <Button type="submit" className={classes.addBtn}>
              Add Room
            </Button>
          </form>
        </Card>
      );
    }
  }
);

export default Overlay;
