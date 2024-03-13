import Card from "../Card/Card";
import classes from "./Overlay.module.css";
import Button from "../Button/Button";
import { useEffect, useState } from "react";
import axios from "axios";

const BuildingOverlay = (props) => {
  const { status, data, archiveId, onUpdate, onConfirm, onDelete } = props;
  const [commentData, setCommentData] = useState([
    {
      sort: "",
      setInOrder: "",
      shine: "",
      standarize: "",
      sustain: "",
      security: "",
    },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(
        `http://localhost:7124/api/comment/${data.id}/comment`
      );
      console.log(response.data);
      setCommentData(response.data);
    };
    fetchData();
  }, [data.id]);

  const onEditHandler = (event) => {
    event.preventDefault();
    const data = {
      sort: event.target[0].value,
      setInOrder: event.target[1].value,
      shine: event.target[2].value,
      standarize: event.target[3].value,
      sustain: event.target[4].value,
      security: event.target[5].value,
      isActive: true,
      dateModified: new Date().toISOString(),
      ratingId: commentData.ratingId,
    };
    console.log("commentData.id >>> ", commentData.id);
    onUpdate(commentData.id, data);
    onConfirm();
  };

  const onDeleteHandler = () => {
    onDelete(archiveId);
    onConfirm();
  };

  if (status === "edit") {
    return (
      <Card className={classes.editOverlay}>
        <h1>Comments</h1>
        {commentData.length === 0 ? (
          <p>No comments yet</p>
        ) : (
          <form onSubmit={onEditHandler} className={classes.editForm}>
            <label>Sort</label>
            <input
              className={classes.search}
              type="text"
              id="sort"
              defaultValue={commentData.sort}
            />
            <label>Set In Order</label>
            <input
              className={classes.search}
              type="text"
              id="setInOrder"
              defaultValue={commentData.setInOrder}
            />
            <label>Shine</label>
            <input
              className={classes.search}
              type="text"
              id="shine"
              defaultValue={commentData.shine}
            />
            <label>Standarize</label>
            <input
              className={classes.search}
              type="text"
              id="standarize"
              defaultValue={commentData.standarize}
            />
            <label>Sustain</label>
            <input
              className={classes.search}
              type="text"
              id="sustain"
              defaultValue={commentData.sustain}
            />
            <label>Security</label>
            <input
              className={classes.search}
              type="text"
              id="security"
              defaultValue={commentData.security}
            />
            <Button type="submit" className={classes.editBtn}>
              Update
            </Button>
          </form>
        )}
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
};

export default BuildingOverlay;
