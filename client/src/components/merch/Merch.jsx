import MerchList from "./merch-list/MerchList"
import JustTextSection from "../just-text-section/JustTextSection"

export default function Merch() {
    return (
        <>
            <MerchList />
            
            <JustTextSection 
                theme={"bg-blue-100"}
                entry= {[`
                    <h3>How to Purchase:</h3>
                    <p>All merchandise will be available for purchase at our official merchandise booths located throughout the festival grounds. Simply stop by any of our booths during the festival to browse and buy your favorite items. Make sure to arrive early as our exclusive merch is available only while supplies last!</p>
                    <p>Celebrate the magic of Festival and take a piece of it home with you. We can't wait to see you there, decked out in your festival best!</p>
                    <p>For any questions or assistance, feel free to visit our info booths or ask any of our friendly staff on the day of the event. Enjoy the festival!</p>
                `]}
            />
        </>
    )
}