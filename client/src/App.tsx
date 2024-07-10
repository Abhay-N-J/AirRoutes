import { Route, Routes, BrowserRouter as Router } from 'react-router-dom'
import './App.css'
import Navbar from './Components/Navbar'
import { ThemeProvider } from './components/theme-provider'
import { ModeToggle } from './components/mode-toggle'
import Home from './Pages/Home'
import Search from './Pages/Search'

function App() {

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme" >
      <Router>
        <div className="flex justify-between items-center p-4 bg-gray-900">
            <Navbar />
            <ModeToggle />
        </div>
        <Routes>
          <Route path='/' Component={Home}></Route>
          <Route path='/search' Component={Search}></Route>
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
