import classes from "./ScoreCard.module.css";
import Card from "../../UI/Card/Card";

const ScoreCard = ({ score, totalScore, title }) => {
  const scoreClass =
    score >= 8 ? classes.okhighlight : score >= 5 ? classes.warnhighlight : "";
  return (
    <Card className={scoreClass}>
      <div className={classes.scoreTitle}>
        <h3>{title}</h3>
      </div>
      <h3>
        {score}/{totalScore}
      </h3>
    </Card>
  );
};

export default ScoreCard;
