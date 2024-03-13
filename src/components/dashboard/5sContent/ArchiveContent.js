import { useState } from "react";
import Overlay from "../../UI/Modal/ArchiveOverlay";
import Content from "../Content";
import addIcon from "../../../static/images/add.png";

const ArchiveContent = () => {
  const urls = [`https://localhost:7124/api/ratings/`];

  const [archiveHeaders] = useState([
    { Header: "Id", accessor: "id" },
    { Header: "Space Id", accessor: "spaceId" },
    { Header: "Sort", accessor: "sort" },
    { Header: "Set In Order", accessor: "setInOrder" },
    { Header: "Shine", accessor: "shine" },
    { Header: "Standarize", accessor: "standarize" },
    { Header: "Sustain", accessor: "sustain" },
    { Header: "Security", accessor: "security" },
    { Header: "Date Modified", accessor: "dateModified" },
  ]);

  return (
    <Content
      headers={archiveHeaders}
      onData={() => {}}
      url={urls}
      title={"Archive"}
      addIcon={addIcon}
      isMore={false}
      isAddBtn={false}
      isFilter={false}
      Overlay={Overlay}
    />
  );
};

export default ArchiveContent;
