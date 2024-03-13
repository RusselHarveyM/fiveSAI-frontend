import React, { useState, useEffect } from "react";
import Card from "../components/UI/Card/Card";
import axios from "axios";
import classes from "../components/buildings/Buildings.module.css";

const Buildings = () => {
  const [buildingData, setBuildingData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await axios
          .get("http://localhost:7124/api/buildings")
          .then((response) => {
            console.log(response.body);
            setBuildingData(response.data);
          });
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className={classes.buildingsContainer}>
      <h3>Buildings</h3>
      <div className={classes.buildingsContainer_lists}>
        {buildingData.map((building) => (
          <Card className={classes.buildingsContainer_cards}>
            <h4>{building.buildingName}</h4>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Buildings;
