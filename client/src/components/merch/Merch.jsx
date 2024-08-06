import { motion } from 'framer-motion' 
import MerchList from "./merch-list/MerchList"
import JustTextSection from "../just-text-section/JustTextSection"

export default function Merch() {
    return (
        <motion.div 
            className="sections-wrapper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: .5, ease: "easeOut" }}
        >
            <MerchList />
            
            <JustTextSection/>
        </motion.div>
    )
}