
import './App.css'
import {BrowserRouter, Navigate, Route, Routes} from "react-router";
import LoginPage from "./pages/LoginPage.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";
import {RoomsPage} from "./pages/RoomsPage.tsx";
import BookingsPage from "./pages/BookingsPage.tsx";
import {GuestsPage} from "./pages/GuestsPage.tsx";
import {HousekeepingPage} from "./pages/HousekeepingPage.tsx";
import {MaintenancePage} from "./pages/MaintenancePage.tsx";
import {useEffect} from "react";
import {getMe} from "./api/auth.ts";
import {useAuthStore} from "./store/authStore.ts";
import {ShiftsPage} from "./pages/ShiftsPage.tsx";
import {ProfilePage} from "./pages/ProfilePage.tsx";
import {ChatPage} from "./pages/ChatPage.tsx";
import {Toaster} from "sonner";

function App() {
  const setUser = useAuthStore((s)=>s.setUser);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if(!token) return;
    const fetch = async () => {
      const user = await getMe()
      setUser(user);
    }
    fetch();
  }, [setUser]);
  return (
    <BrowserRouter>
        <Toaster position={"top-right"} richColors/>
      <Routes>
        <Route path={"login"} element={<LoginPage/>}/>
        <Route path={"dashboard"} element={<DashboardPage/>}/>
        <Route path={"rooms"} element={<RoomsPage/>}/>
        <Route path = {"tasks"} element={<HousekeepingPage/>}/>
        <Route path={"guests"} element={<GuestsPage/>}/>
        <Route path={"bookings"} element={<BookingsPage/>}/>
        <Route path={"shifts"} element={<ShiftsPage/>}/>
        <Route path={"*"} element={<Navigate to="/login" replace />}/>
        <Route path = {"/maintenance"} element={<MaintenancePage/>}/>
        <Route path = {"profile"} element={<ProfilePage/>}/>
        <Route path={"chat"} element={<ChatPage/>}/>
      </Routes>

    </BrowserRouter>
  )
}

export default App
