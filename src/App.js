import "./App.css";
import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import Room from "./pages/Room";

const routeDefinition = createRoutesFromElements(
  <Route path="/">
    <Route path="/" element={<Login />}></Route>
    <Route path= "/dashboard" element={<Dashboard />}></Route>
    <Route path="/:buildingId/rooms">
      <Route index={true} element={<Rooms />}></Route>
    </Route>
    <Route path="/:roomId">
      <Route index={true} element={<Room />}></Route>
    </Route>
  </Route>
);

const router = createBrowserRouter(routeDefinition);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
