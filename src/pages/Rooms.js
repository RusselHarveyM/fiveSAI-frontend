import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Card from "../components/UI/Card/Card";
import axios from "axios";
import classes from "../components/rooms/Rooms.module.css";
import { NavLink } from "react-router-dom";

const Rooms = () => {
  const [roomData, setRoomData] = useState([]);
  const [buildingData, setBuildingData] = useState([]);
  const params = useParams();

  useEffect(() => {
    const fetchBuildingData = async () => {
      try {
        const response = await axios.get(
          `https://localhost:7124/api/buildings/${params.buildingId}/building`
        );
        setBuildingData(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchBuildingData();
  }, [params.buildingId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("https://localhost:7124/api/rooms");
        setRoomData(
          response.data.filter(
            (data) => data.buildingId === parseInt(params.buildingId)
          )
        );
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [params.buildingId]);

  const handleBackButtonClick = () => {
    window.history.back();
  };

  return (
    <div className={classes.roomsContainer}>
      <button
        onClick={handleBackButtonClick}
        className={classes.backButton}
      ></button>
      <div className={classes.roomsContainer_header}>
        <img
          src={`data:image/png;base64,${buildingData.image}`}
          alt="Building preview"
        />
        <div className={classes.roomsContainer_header_title}>
          <h3>{buildingData.buildingName}</h3>
          <h4>{roomData.length} rooms</h4>
        </div>
      </div>
      <div className={classes.roomsContainer_lists}>
        {roomData?.map((room) => (
          <NavLink key={room.id} to={`/${room.id}`}>
            <Card className={classes.roomsContainer_cards} key={room.id}>
              <img
                src={`data:image/png;base64,${room.image}`}
                alt="room preview"
              />
              <div className={classes.roomsContainer_cards_title}>
                <h4>{room.roomNumber}</h4>
              </div>
            </Card>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Rooms;
