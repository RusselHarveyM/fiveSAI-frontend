import React, { useState } from "react";

import Overlay from "../../UI/Modal/UserOverlay";
import Content from "../Content";

import addIcon from "../../../static/images/add-user.png";

const UserContent = () => {
  const urls = [`https://localhost:7124/api/user/`];

  const [userHeaders] = useState([
    { Header: "Id", accessor: "id" },
    { Header: "Last Name", accessor: "lastName" },
    { Header: "First Name", accessor: "firstName" },
    { Header: "Username", accessor: "username" },
  ]);

  return (
    <Content
      headers={userHeaders}
      onData={() => {}}
      url={urls}
      title={"Users"}
      addIcon={addIcon}
      isAddBtn={true}
      isMore={false}
      isFilter={true}
      Overlay={Overlay}
    />
  );
};

export default React.memo(UserContent);
