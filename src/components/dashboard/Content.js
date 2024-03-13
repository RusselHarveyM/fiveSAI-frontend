import { useState, useCallback, useEffect, useMemo } from "react";
import ReactDom from "react-dom";
import axios from "axios";
import PropTypes from "prop-types";
import Table from "../UI/table/Table";
import classes from "./Content.module.css";
import Backdrop from "../UI/Modal/BackdropModal";
import action from "../../static/images/link.png";
import deleteIcon from "../../static/images/delete.png";
import editIcon from "../../static/images/edit.png";
import moreIcon from "../../static/images/more.png";
import GlobalFilter from "../GlobalFilter";

const Content = ({
  url,
  headers,
  onData,
  title,
  addIcon,
  isMore,
  isAddBtn,
  Overlay,
  isFilter,
}) => {
  const [contentData, setContentData] = useState([]);
  const [clickedData, setClickedData] = useState();
  const [actionBtns, setActionBtns] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState({ filter: "default", setFil: () => {} });
  const [isEdit, setIsEdit] = useState(false);
  const [isAdd, setIsAdd] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [images, setImages] = useState([]);
  const [isAddImage, setIsAddImage] = useState(false);
  const [refreshData, setRefreshData] = useState(false);

  const fetchContent = useCallback(async () => {
    let response;
    try {
      response = await axios.get(url[0]);
      console.log("test >>> ", response);
    } catch (error) {
      console.log(error);
    }
    return response && Array.isArray(response.data) ? response.data : [];
  }, [url]);

  const addSpaceImage = useCallback(
    async (id, file) => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        await axios.post(url[1] + id, formData);
        setRefreshData(true);
      } catch (error) {
        console.log(error);
      }
    },
    [url]
  );

  const ActionBtnHandler = useCallback(
    async (rowId, data) => {
      setClickedData(data);
      if (isMore) {
        try {
          await axios
            .get(`http://fivesai-backend/api/spaceimage/get/${rowId}`)
            .then((data) => {
              setImages(data);
              console.log(data);
            });
        } catch (error) {
          console.log(error);
          setImages([]);
        }
      }
      setActionBtns((prevState) => ({
        ...Object.keys(prevState).reduce((acc, key) => {
          acc[key] = false;
          return acc;
        }, {}),
        [rowId]: !prevState[rowId],
      }));
    },
    [setActionBtns, isMore]
  );

  useEffect(() => {
    fetchContent().then((list) => {
      setContentData(list);
      setRefreshData(false);
      // onData(list);
    });
  }, [fetchContent, refreshData]);

  const deleteContent = useCallback(
    async (name) => {
      try {
        await axios.delete(url[0] + name);
        setRefreshData(true);
      } catch (error) {
        console.log(error);
      }
    },
    [url]
  );

  const updateContent = useCallback(
    async (id, data) => {
      console.log("id >>> ", id);
      try {
        await axios.put(url[0] + id, {
          ...data,
        });
        setRefreshData(!refreshData);
      } catch (error) {
        console.log(error);
      }
    },
    [refreshData, url]
  );

  const addContent = useCallback(
    async (data) => {
      try {
        await axios.post(url[0], { ...data });
        setRefreshData(!refreshData);
      } catch (error) {
        console.log(error);
      }
    },
    [url, refreshData]
  );

  const onAddImage = useCallback(() => {
    setIsModalOpen(true);
    setIsAddImage(true);
  }, []);

  const onDeleteContent = useCallback(() => {
    setIsModalOpen(true);
    setIsDelete(true);
  }, []);

  const onEditContent = useCallback(() => {
    setIsModalOpen(true);
    setIsEdit(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setIsDelete(false);
    setIsEdit(false);
    setIsAdd(false);
    setActionBtns({});
  }, []);

  const onAddContent = useCallback(() => {
    setIsModalOpen(true);
    setIsAdd(true);
  }, []);

  const columnDefinition = useMemo(
    () => [
      ...headers,
      {
        Header: "Actions",
        Cell: ({ row }) => (
          <div className={classes.actionCell}>
            {!actionBtns[row.original["id"]] ? (
              <button
                onClick={() =>
                  ActionBtnHandler(row.original["id"], row.original)
                }
                className={classes.actionBtn}
              >
                <img src={action} alt="actionIcon" />
              </button>
            ) : (
              <div
                className={`${classes.actionBtnChoices} ${classes.actionBtn}`}
              >
                <button onClick={onEditContent}>
                  <img src={editIcon} alt="editIcon" />
                </button>
                <button onClick={onDeleteContent}>
                  <img src={deleteIcon} alt="deleteIcon" />
                </button>
                {isMore && (
                  <button onClick={onAddImage}>
                    <img src={moreIcon} alt="moreIcon" />
                  </button>
                )}
              </div>
            )}
          </div>
        ),
      },
    ],
    [
      actionBtns,
      ActionBtnHandler,
      onDeleteContent,
      onEditContent,
      onAddImage,
      headers,
      isMore,
    ]
  );

  const filterHandler = (fil, setFil) => {
    setFilter({ filter: fil, setFil: setFil });
  };

  return (
    <div className={classes.tableContainer}>
      {isModalOpen && (
        <>
          {ReactDom.createPortal(
            <Backdrop onConfirm={closeModal} />,
            document.getElementById("backdrop-root")
          )}
          {ReactDom.createPortal(
            <Overlay
              onDelete={deleteContent}
              onUpdate={updateContent}
              onConfirm={closeModal}
              onCreate={addContent}
              imageData={images}
              data={clickedData}
              onAddImage={addSpaceImage}
              contentId={Object.keys(actionBtns).find(
                (key) => actionBtns[key] === true
              )}
              status={
                `${isDelete ? "delete" : ""}` ||
                `${isEdit ? "edit" : ""}` ||
                `${isAdd ? "create" : ""}` ||
                `${isAddImage ? "image" : ""}`
              }
            />,
            document.getElementById("overlay-root")
          )}
        </>
      )}
      <header className={classes.tableHeader}>
        <div className={classes.createEntity}>
          <h1>{title}</h1>
          {isAddBtn && (
            <button onClick={onAddContent} className={classes.addBtn}>
              <img src={addIcon} alt="addIcon" />
            </button>
          )}
        </div>
        {isFilter && (
          <GlobalFilter filter={filter.filter} setFilter={filter.setFil} />
        )}
      </header>
      <Table
        columns={columnDefinition}
        data={contentData}
        filter={filter.filter}
        filterHandler={filterHandler}
      />
    </div>
  );
};

// Content.propTypes = {
//   onData: PropTypes.func.isRequired,
// };

export default Content;
