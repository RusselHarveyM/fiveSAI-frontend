import { useState, useEffect, useMemo, useCallback, useReducer } from "react";
import classes from "../components/dashboard/dashboard.module.css";
import logo from "../static/images/citu_logo.png";

import DashBoardContent from "../components/dashboard/DashBoardContent";
import Manage from "../components/dashboard/Manage";

import axios from "axios";
import BuildingContext from "../context/building-context";

const initialState = {
  isNewData: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_IS_NEW_DATA":
      return { ...state, isNewData: action.payload };
    default:
      return state;
  }
};

const Dashboard = () => {
  const [isDashboardOpen, setIsDashboardOpen] = useState(true);
  const [buildingData, setBuildingData] = useState([]);
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://fivesai-backend-production.up.railway.app/api/buildings"
        );
        setBuildingData(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [state.isNewData]);

  const providerValue = useMemo(
    () => ({
      buildingData,
    }),
    [buildingData]
  );

  const toggleDashboard = () => {
    setIsDashboardOpen(!isDashboardOpen);
  };

  const refreshNewData = useCallback(
    (data) => {
      setBuildingData(data);
      dispatch({ type: "SET_IS_NEW_DATA", payload: !state.isNewData });
    },
    [state.isNewData]
  );

  useEffect(() => {
    return () => {
      setBuildingData([]);
    };
  }, []);

  return (
    <>
      <header className={classes.dashboardHeader}>
        <div className={classes.intro}>
          <img src={logo} alt="logo" className={classes.logo} />
          <div className={classes.introText}>
            <h2>WELCOME BACK</h2>
            <h1>CEBU INSTITUTE OF TECHNOLOGY UNIVERSITY</h1>
          </div>
        </div>
        <nav>
          <ul className={classes.dashboardNav}>
            <li>
              <button
                onClick={toggleDashboard}
                className={`${isDashboardOpen ? classes.active : ""}`}
              >
                Dashboard
              </button>
            </li>
            <li>
              <button
                onClick={toggleDashboard}
                className={`${!isDashboardOpen ? classes.active : ""}`}
              >
                Manage
              </button>
            </li>
          </ul>
        </nav>
      </header>
      <main>
        <BuildingContext.Provider value={providerValue}>
          {isDashboardOpen ? (
            <DashBoardContent />
          ) : (
            // <Manage onData={refreshNewData} />
            <Manage />
          )}
        </BuildingContext.Provider>
      </main>
    </>
  );
};

export default Dashboard;
