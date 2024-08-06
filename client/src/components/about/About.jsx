import { motion } from 'framer-motion' 
import Singers from "../singers/Singers"
import TicketsAndProgram from "../tickets-and-program/TicketsAndProgram"

export default function About() {
    return (
        <motion.div 
            className="sections-wrapper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: .5, ease: "easeOut" }}
        >
            <Singers/>
            <TicketsAndProgram/>
        </motion.div>
    )
}