import React, { useEffect, useState } from 'react';
import Loader from '../genericComponents/Loader';
import "./CoursesPage.scss";

function CoursesPage() {
    const [fadeInClasses, setFadeInClasses] = useState("dont-show");
    const [loadedImgs, setLoadedImgs] = useState(0);
    useEffect(() => {
        if (loadedImgs === 2) {
            setFadeInClasses("fade-in");
        }
    }, [loadedImgs])
    return (
        <>
            <div id="courses-page" className="fade-in">
                <img alt="" src="/images/courses-1.jpg" className={`campus-il ${fadeInClasses}`} id="image-1" draggable={false} onLoad={() => setLoadedImgs(prevState=>prevState+1)} />
                <img alt="" src="/images/courses-2.jpg" className={`campus-il ${fadeInClasses}`} id="image-2" draggable={false} onLoad={() => setLoadedImgs(prevState=>prevState+1)} />
                {fadeInClasses === "fade-in" ? <div id="campus-il-btn" className={fadeInClasses}><a href="https://campus.gov.il/">למעבר לקמפוס IL</a></div> : <Loader />}
            </div>
        </>
    )
}

export default CoursesPage;