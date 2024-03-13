import React from "react";
import Content from "../Content";

import { useState } from "react";
import addIcon from "../../../static/images/add-room.png";
import Overlay from "../../UI/Modal/RoomOverlay";

const RoomContent = ({ onData }) => {
  const urls = [`https://fivesai-backend:3000/api/rooms/`];

  const [roomHeaders] = useState([
    { Header: "Id", accessor: "id" },
    { Header: "Building Id", accessor: "buildingId" },
    { Header: "Room name", accessor: "roomNumber" },
    { Header: "Status", accessor: "status" },
  ]);

  return (
    <Content
      headers={roomHeaders}
      onData={onData}
      url={urls}
      title={"Rooms"}
      addIcon={addIcon}
      isMore={false}
      isAddBtn={true}
      isFilter={false}
      Overlay={Overlay}
    />
  );
};

export default RoomContent;
