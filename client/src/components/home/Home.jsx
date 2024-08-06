import { motion } from 'framer-motion'
import Hero from "./hero/Hero";
import SingersSlider from "../singers-slider/SingersSlider";

export default function Home() {
    return (
        <motion.div 
            className="sections-wrapper"
            initial={{ opacity: .5 }}
            animate={{ opacity: 1 }}
            transition={{ duration: .25, ease: "easeOut" }}
        >
            <Hero />
            <SingersSlider/>
        </motion.div>
    )
}