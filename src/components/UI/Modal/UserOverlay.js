import Card from "../Card/Card";
import classes from "./Overlay.module.css";
import Button from "../Button/Button";

const Overlay = (props) => {
  const { status, data, contentId, onUpdate, onConfirm, onDelete, onCreate } =
    props;
  const { firstName, lastName, role, username, password } = data || {};

  const onEditHandler = (event) => {
    event.preventDefault();
    const data = {
      Id: contentId,
      firstName: event.target[0].value,
      lastName: event.target[1].value,
      role: event.target[2].value,
      username,
      password,
    };
    onUpdate(contentId, data);
    onConfirm();
  };

  const onDeleteHandler = () => {
    onDelete(contentId);
    onConfirm();
  };

  const onAddHandler = (event) => {
    event.preventDefault();
    const data = {
      Id: "",
      firstName: event.target[0].value,
      lastName: event.target[1].value,
      role: event.target[2].value,
      username: event.target[3].value,
      password: event.target[4].value,
    };
    onCreate(data);
    onConfirm();
  };

  if (status === "edit") {
    return (
      <Card className={classes.editOverlay}>
        <form onSubmit={onEditHandler} className={classes.editForm}>
          <label>First Name</label>
          <input
            className={classes.search}
            type="text"
            id="firstName"
            defaultValue={firstName}
          />
          <label>Last Name</label>
          <input
            className={classes.search}
            type="text"
            id="lastName"
            defaultValue={lastName}
          />
          <label>Role</label>
          <input
            className={classes.search}
            type="text"
            id="role"
            defaultValue={role}
          />
          <Button type="submit" className={classes.editBtn}>
            Update
          </Button>
        </form>
      </Card>
    );
  }

  if (status === "delete") {
    return (
      <Card className={classes.deleteOverlay}>
        <h1>Are you sure?</h1>
        <Button onClick={onDeleteHandler}>Confirm</Button>
      </Card>
    );
  }

  if (status === "create") {
    return (
      <Card className={classes.editOverlay}>
        <form onSubmit={onAddHandler} className={classes.editForm}>
          <label>First Name</label>
          <input className={classes.search} type="text" id="firstName" />
          <label>Last Name</label>
          <input className={classes.search} type="text" id="lastName" />
          <label>Role</label>
          <input className={classes.search} type="text" id="role" />
          <label>Username</label>
          <input className={classes.search} type="text" id="username" />
          <label>Password</label>
          <input className={classes.search} type="password" id="password" />
          <Button type="submit" className={classes.addBtn}>
            Add User
          </Button>
        </form>
      </Card>
    );
  }
};

export default Overlay;
