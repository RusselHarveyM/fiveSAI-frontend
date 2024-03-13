import classes from "./GlobalFilter.module.css";

const GlobalFilter = ({ filter, setFilter }) => {
  return (
    <span>
      <input
        className={classes.search}
        type="text"
        value={filter || ""}
        placeholder="Search..."
        onChange={(e) => setFilter(e.target.value)}
      />
    </span>
  );
};

export default GlobalFilter;
