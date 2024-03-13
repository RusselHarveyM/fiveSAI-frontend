import classes from "./Manage.module.css";
import { useReducer } from "react";
import UserContent from "./userContent/UserContent";
import BuildingContent from "./buildingContent/BuildingContent";
import RoomContent from "./roomContent/RoomContent";
import SpaceContent from "./spaceContent/SpaceContent";
import ArchiveContent from "./5sContent/ArchiveContent";

const initialState = {
  usersContent: true,
  buildingContent: false,
  roomContent: false,
  spaceContent: false,
  _5sContent: false,
};

const contentReducer = (state, action) => {
  switch (action.type) {
    case "TOGGLE_USERS":
      return { ...initialState, usersContent: true };
    case "TOGGLE_BUILDING":
      return { ...initialState, buildingContent: true, usersContent: false };
    case "TOGGLE_ROOM":
      return { ...initialState, roomContent: true, usersContent: false };
    case "TOGGLE_SPACE":
      return { ...initialState, spaceContent: true, usersContent: false };
    case "TOGGLE_5S":
      return { ...initialState, _5sContent: true, usersContent: false };
    default:
      return state;
  }
};

const Manage = ({ onData }) => {
  const [state, dispatch] = useReducer(contentReducer, initialState);

  return (
    <>
      <nav>
        <ul className={classes.manageNav}>
          <li>
            <button
              onClick={() => dispatch({ type: "TOGGLE_USERS" })}
              className={`${state.usersContent ? classes.active : ""}`}
            >
              Users
            </button>
          </li>
          <li>
            <button
              onClick={() => dispatch({ type: "TOGGLE_BUILDING" })}
              className={`${state.buildingContent ? classes.active : ""}`}
            >
              Building
            </button>
          </li>
          <li>
            <button
              onClick={() => dispatch({ type: "TOGGLE_ROOM" })}
              className={`${state.roomContent ? classes.active : ""}`}
            >
              Room
            </button>
          </li>
          <li>
            <button
              onClick={() => dispatch({ type: "TOGGLE_SPACE" })}
              className={`${state.spaceContent ? classes.active : ""}`}
            >
              Space
            </button>
          </li>
          <li>
            <button
              onClick={() => dispatch({ type: "TOGGLE_5S" })}
              className={`${state._5sContent ? classes.active : ""}`}
            >
              5s
            </button>
          </li>
        </ul>
      </nav>
      <main className={classes.manageContent}>
        {state.usersContent ? <UserContent /> : ""}
        {state.buildingContent ? <BuildingContent /> : ""}
        {state.roomContent ? <RoomContent /> : ""}
        {state.spaceContent ? <SpaceContent /> : ""}
        {state._5sContent ? <ArchiveContent /> : ""}
      </main>
    </>
  );
};
export default Manage;
