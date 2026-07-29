
import './App.css'
import {BrowserRouter, Navigate, Route, Routes} from "react-router";
import LoginPage from "./pages/LoginPage.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";
import {RoomsPage} from "./pages/RoomsPage.tsx";
import BookingsPage from "./pages/BookingsPage.tsx";
import {GuestsPage} from "./pages/GuestsPage.tsx";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path={"login"} element={<LoginPage/>}/>
        <Route path={"dashboard"} element={<DashboardPage/>}/>
        <Route path={"rooms"} element={<RoomsPage/>}/>
        <Route path={"guests"} element={<GuestsPage/>}/>
        <Route path={"bookings"} element={<BookingsPage/>}/>
        <Route path={"*"} element={<Navigate to="/login" replace />}/>
      </Routes>

    </BrowserRouter>
  )
}

export default App
