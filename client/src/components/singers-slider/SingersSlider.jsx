import './SingersSlider.scss'
import { Navigation, Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useGetFewSingers } from '../../hook/useSingers';
import { Link } from 'react-router-dom';
import Singer from '../singer/Singer';

import 'swiper/css';
import 'swiper/css/navigation';


export default function SingersSlider() {
    const [singers] = useGetFewSingers(6);

    return (
        <div className="section-singers-slider">
            <div className="section__inner">
                <div className="section__head">
                    <h2>Some of our starts</h2>
                </div>

                <div className="section__body">
                    <Swiper
                        loop={'true'}
                        freeMode={'true'}
                        grabCursor={'true'}
                        centeredSlides={true}
                        spaceBetween={50}
                        slidesPerView={4}
                        navigation
                        speed={1000}
                        modules={[Navigation, Autoplay]}
                        autoplay={{ 
                            delay: 2500,
                            disableOnInteraction: false, 
                        }}
                    >
                        {singers.length > 0 
                            && singers.map(singer => 
                                <SwiperSlide key={singer._id}>
                                    <Singer  singer={singer}/>
                                </SwiperSlide>
                            )
                        }
                    </Swiper>
                </div>

                <div className="section__foot">
                    <Link to="/about" className='btn'>View All Singers</Link>
                </div>
            </div>
        </div>
    )
}