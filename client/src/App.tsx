import { Route, Routes, BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import Navbar from "./Components/Navbar";
import { ThemeProvider } from "./components/theme-provider";
import Home from "./Pages/Home";
import Search from "./Pages/Search";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";

import {
  ThemeProvider as ThemeProvider2,
  createTheme as createTheme2,
} from "@mui/material/styles";
import MapComponent from "./Pages/Map";

const darkTheme = createTheme2({
  palette: {
    mode: "dark",
  },
});

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ThemeProvider2 theme={darkTheme}>
        <QueryClientProvider client={queryClient}>
          <Router>
            <div className="flex justify-between items-center p-4 bg-gray-900">
              <Navbar />
              <Toaster />
            </div>
            <Routes>
              <Route path="/" Component={Home}></Route>
              <Route path="/search" Component={Search}></Route>
              <Route path="/map" Component={MapComponent}></Route>
            </Routes>
          </Router>
        </QueryClientProvider>
      </ThemeProvider2>
    </ThemeProvider>
  );
}

export default App;
