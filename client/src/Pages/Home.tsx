import { motion } from "framer-motion"
import image from "../assets/flight_2.jpg"
import "./styles.css"
import { TypewriterEffect } from "../components/ui/typewriter"

const words = [
    {text: "Welcome"},
    {text: "to"},
    {text: "find"},
    {text: "your"}, 
    {text: "flights"}
]

const Home = () => {
    return (
        <>
            <div className="flex justify-center items-center space-y-4 opacity-40">
            <motion.img 
                    className="opacity-50 h-1/5"
                    src={image}
                    alt="Flight Animation"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                />
            </div>
            <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <TypewriterEffect words={words}/>
            </div>
        </>
    )
}

export default Home