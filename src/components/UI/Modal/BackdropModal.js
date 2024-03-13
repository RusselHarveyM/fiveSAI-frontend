import classes from "./Backdrop.module.css";

const BackdropModal = (props) => {
  return <div className={classes.backdrop} onClick={props.onConfirm} />;
};

export default BackdropModal;
