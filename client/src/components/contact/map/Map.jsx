import './Map.scss';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const coordinates = {
    lat: 42.673608493212825,
    lng: 27.712064018107984
};


export default function Map() {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: "AIzaSyAEhptexCU8P3_PhrfXThUTMWMLgNLKr6I"
    })
    
    return (
        <div className="map">
            <div className="map__overlay">
                <div className="map__overlay-inner">
                    <img src="/public/images/svg/pin.svg" alt="" />
                    <address>
                        Cacao Beach Club<br/>
                        Sunny Beach, 8240 <br/>
                        Bulgaria
                    </address>
                </div>
            </div>
            <div className="map-wrapper">
                {isLoaded &&
                    <GoogleMap
                        center={coordinates}
                        zoom={16}
                    >
                        <Marker 
                            position={coordinates} 
                            icon={'/public/images/temp/ico-marker.png'}
                        />
                    </GoogleMap>
                }
            </div>
        </div>
    )
}