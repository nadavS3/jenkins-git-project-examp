import React, { useEffect, useRef, useState } from 'react';

import { useHistory } from 'react-router-dom';
import { USER_ROLE } from "../consts/consts";
import { NAVBAR_ITEMS } from "../consts/navbar";

import './navbar.scss';
import { useAdminData } from "../context/adminDataCtx";
import { observer } from 'mobx-react-lite';

const navLinks = [
    { link: "/", displayName: "כניסות", constName: NAVBAR_ITEMS.USERS },
    { link: "/statistics", displayName: "סטטיסטיקות", constName: NAVBAR_ITEMS.STATISTICS },
    { link: "/categories", displayName: "קטגוריות", constName: NAVBAR_ITEMS.CATEGORIES },
    { link: "/organizations", displayName: "ארגונים", constName: NAVBAR_ITEMS.ORGANIZATIONS },
]

const getTabByUrl = url => {
    return navLinks.find(nav => nav.link === url) || navLinks[0]
}

const Navbar = (props) => {
    const adminDataCtx = useAdminData();
    const history = useHistory();
    const selectedRef = useRef()
    const hrefsplit = window.location.href.split("/");
    const [tab, setTab] = useState(getTabByUrl("/" + hrefsplit[hrefsplit.length - 1]));
    const [imgLoad, setImgLoad] = useState(false);

    const [underlineStyle, setUnderlineStyle] = useState({});

    //*if user type is admin and not super admin we pop out of navLinks the last link
    useEffect(() => {
        if (adminDataCtx.adminRole && adminDataCtx.adminRole !== USER_ROLE.SUPERADMIN) {
            navLinks.pop(); navLinks.pop();
        }
    }, [adminDataCtx.adminRole])

    useEffect(() => {
        let currUrl = null;
        try {
            currUrl = "/" + window.location.href.split("/")[hrefsplit.length - 1];
            // console.log(currUrl, tab);
            if (currUrl !== tab.link)
                history.push(tab.link || currUrl);

        } catch (e) { tab && history.push(tab.link); };

        // if (!imgLoad) return
        let el = selectedRef.current || document.getElementById('default-nav-item-element');
        const rec = el.getBoundingClientRect(); // or .getPosition ?
        // setUnderlineStyle({ left: `${el.offsetLeft}px`, width: `${el.offsetWidth}px` })
        setUnderlineStyle({ left: `${rec.left}px`, width: `${rec.width}px` })
    }, [tab, imgLoad, props, history, hrefsplit.length])

    const handleNavItemsClick = (tab) => {
        setTab(tab)
    }

    const handleImgLoad = () => {
        setImgLoad(true)
    }

    return (
        <div id="top-bar-container" className="no-user-select no-scroller width85" >

            <div id="navbar-underline" style={underlineStyle} className={imgLoad ? "transition-all" : undefined} ></div>
            <div id="navs-container" >
                {navLinks.map(nav => {
                    return (
                        <div id={nav.constName === NAVBAR_ITEMS.USERS ? "default-nav-item-element" : undefined} ref={tab && tab.link === nav.link ? selectedRef : undefined} key={nav.link} onClick={() => { handleNavItemsClick(nav) }} className={`nav-item ${tab && tab.link === nav.link ? "nav-item-selected" : ""}`}>
                            <div className="nav-item-name">{nav.displayName}</div>
                        </div>
                    )
                })}
            </div>
                        <img onLoad={handleImgLoad} id="israeldig-logo" src="/logos/israel_logo_white.gif" alt='סמל הילמ"ה' draggable={false} />
        </div>

    );
}

export default observer(Navbar);