import classes from "./ScoreCard.module.css";
import Card from "../../UI/Card/Card";

const ScoreCard = ({ score, totalScore, title }) => {
  let scoreClass = "";
  if (score >= 8) {
    scoreClass = classes.okhighlight;
  } else if (score >= 4) {
    scoreClass = classes.warnhighlight;
  } else if (score > 0) {
    scoreClass = classes.errorhighlight;
  }
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
