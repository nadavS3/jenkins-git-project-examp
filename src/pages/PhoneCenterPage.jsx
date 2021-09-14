import React, { useState, useEffect } from "react";
import { isMobileOnly, MobileOnlyView } from "react-device-detect";
import { observer } from "mobx-react-lite";
import loadable from '@loadable/component'

import { useUsersStore } from "../stores/index.store";

// import IntroductionPage from "./generalInfo/IntroductionPage";
// import InstructionsPage from "./generalInfo/InstructionsPage";
import OrganizationFormPage from "./personalInfo/OrganizationFormPage";
// import PersonalDataPage from "./personalInfo/PersonalDataPage";
// import SectorFormPage from "./personalInfo/SectorFormPage";

import { PAGE_NUMBERS, POP_UP_MESSAGE_PROBLEM } from "../consts/consts"
import { getCookie, OUR_COOKIE } from "../consts/cookies";

import Loader from "../genericComponents/Loader";
import BrowserTabletView from "../genericComponents/browserTabletView";

import "./PhoneCenterPage.scss";

const IntroductionPage = loadable(() => import('./generalInfo/IntroductionPage'));
const InstructionsPage = loadable(() => import('./generalInfo/InstructionsPage'));
// const OrganizationFormPage = loadable(() => import('./personalInfo/OrganizationFormPage'));
const PersonalDataPage = loadable(() => import('./personalInfo/PersonalDataPage'));
const SectorFormPage = loadable(() => import('./personalInfo/SectorFormPage'));


function PhoneCenterPage(props) {

  const usersStore = useUsersStore();
  //loadpage set to isMobileOnly because the images that are being renderd is displayed only on tabletbrowser view so in mobile there is no onload to cancel loadpage
  const [loadPage, setLoadPage] = useState(0);
  const [phoneFade, setPhoneFade] = useState('');

  const [ovalAnimation2, setOvalAnimation2] = useState('');
  const [ovalAnimation2FadeOut, setOvalAnimation2FadeOut] = useState("");
  //*in charge of mobile oval 1 class
  const [mobileOvalAllPagesClass, setMobileOvalAllPagesClass] = useState('')
  //*in charge of mobile oval 2 class
  const [mobileOval2Class, setMobileOval2Class] = useState('')
  //*in charge of mobile button class
  const [mobileButtonAnimationClass, setMobileButtonAnimationClass] = useState('')
  //* in charge of text inside button mobile
  const [mobileButtonText, setMobileButtonText] = useState('לשאלון')
  //*in charge of the plant img mobile
  const [mobilePlantClass, setMobilePlantClass] = useState('')
  //*in charge of woman organization mobile img
  const [mobileWomanClass, setMobileWomanClass] = useState('hide-shape')
  //*in charge of 2 people personalData mobile img
  const [mobile2PeopleClass, setMobile2PeopleClass] = useState('hide-shape')
  //*in charge of standing women sector mobile img
  const [mobileWomanStanding, setMobileWomanStanding] = useState('hide-shape')
  //*in charge of sitting window women instruction mobile img
  const [mobileWomanSittingWindow, setMobileWomanSittingWindow] = useState('hide-shape')


  //in charge of going to next page in mobile view
  const nextPageMobile = () => {
    switch (usersStore.currentPage) { // set animations for every page
      case PAGE_NUMBERS.INTRODUCTION_PAGE:
        setMobileOval2Class('mobile-oval2-organization-animation')
        setMobileWomanClass('fade-in')
        setMobilePlantClass('mobile-plant-1st-animation')
        setMobileButtonAnimationClass("mobile-introduction-button-animation")
        setMobileOvalAllPagesClass('mobile-introduction-oval1-animation')
        setMobileButtonText('המשך')

        break;
      case PAGE_NUMBERS.ORGANIZATION_PAGE:
        setMobile2PeopleClass('fade-in')
        setMobileWomanClass('fade-out-1s')
        setMobilePlantClass('mobile-plant-2st-animation')
        setMobileButtonAnimationClass('')
        setMobileOvalAllPagesClass('mobile-organization-form-oval1-animation')
        break;
      case PAGE_NUMBERS.PERSONAL_DATA_PAGE:
        setMobileWomanStanding('fade-in')
        setMobile2PeopleClass('fade-out-1s')
        setMobileButtonText('סיום')
        setMobileButtonAnimationClass("mobile-personal-button-animation")
        setMobileOvalAllPagesClass('mobile-personal-data-oval1-animation')
        break;
      case PAGE_NUMBERS.SECTOR_PAGE:
        setMobileOval2Class('mobile-oval2-sector-animation')
        setMobileWomanSittingWindow('fade-in')
        setMobileWomanStanding('fade-out-1s')
        setMobilePlantClass('mobile-plant-fade-animation')
        setMobileButtonText('יאללה נתחיל')
        setMobileOvalAllPagesClass('mobile-sector-fade-out-oval1')
        break;
      //here we dont want nextPage to be activated...
      case PAGE_NUMBERS.INSTRUCTION_PAGE:
        setMobileWomanSittingWindow('mobile-woman-sitting-window-shift-animation')
        setMobileOval2Class('mobile-oval2-instruction-animation')
        setMobileButtonAnimationClass('fade-out')
        return
      default:
        throw POP_UP_MESSAGE_PROBLEM
    }
    nextPage();
  }
  const handleLoadPage = () => {
    //* here we add 1 every time a photo is finished loading, we dont combine the 2 because we want a distinct diffrence between mobile and browser
    //* so in the future if we want to add pictures only to mobile we could do that
    if (isMobileOnly) {
      return (loadPage === 7)
    } else {
      return (loadPage === 2)
    }
  }

  useEffect(() => {
    if (getCookie(OUR_COOKIE)) {
      usersStore.showErrorPopUp("ניתן לענות על השאלון פעם אחת בלבד")
    } // cookies already exist
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const nextPage = () => {
    usersStore.setCurrentPage(usersStore.currentPage + 1);
  }
  const addOneToLoaded = () => {
    setLoadPage(prevstate => prevstate + 1)
  }

  const [browserOval, setBrowserOval] = useState(false);
  let ovalImgOrgAndPersonal = <img alt="" src="/images/animations/OrganizationBubble2.png" onLoad={() => setBrowserOval(true)} className={`${browserOval ? `fade-in ${ovalAnimation2} ${ovalAnimation2FadeOut}` : 'hide-shape'} `} id={`organization-oval2`} draggable={false} />
  let page;

  //* we pass all the mobile related props we need inside mobileElements
  //*we want the button to be the same button just in different pages so we send him to all pages(he has to be inside because of the page container spreads over all the screen so if he is outside we cant press it(if we change his z index we cant press anything inside page ) ) and we wrap that button inside a div in each page , the outer div has onclick which activate the correct function
  //*notice that even though we use the same variable on all pages the componnent itself being unmounted so the button still gets remounted on page switch
  let mobileAllButton = <div className={`phone-btn mobile-btn ${mobileButtonAnimationClass}`} tabIndex="0" >{mobileButtonText}</div>
  //* important concept!: here we make a div in the size of the page which is posiion absolute solely for the mobile animations, that is because when they are in the normal container they look bad when keyboard open, also some of the animations go outside of the screen and that causes an unwanted scroll on page

  let mobileAnimationsAllPages = <div id='mobile-all-animation-container' className={`${handleLoadPage() ? 'fade-in' : 'hide-shape'}`} >
    <img alt="" src="/images/animations/OrganizationBubble2.svg" onLoad={() => setLoadPage(prevstate => prevstate + 1)} className={` mobile-oval1 ${mobileOvalAllPagesClass}`} id={``} draggable={false} />
    <img alt="" src="/images/mobile/plant.svg" onLoad={() => setLoadPage(prevstate => prevstate + 1)} className={`  mobile-plant ${mobilePlantClass}`} id={``} draggable={false} />
    <img alt="" src="/images/mobile/woman.svg" id="" onLoad={() => setLoadPage(prevstate => prevstate + 1)} className={` mobile-woman ${mobileWomanClass} `} draggable={false} />
    <img alt="" src="/images/mobile/twoPeople.svg" id="" onLoad={() => setLoadPage(prevstate => prevstate + 1)} className={` mobile-two-people ${mobile2PeopleClass} `} draggable={false} />
    <img alt="" src="/images/mobile/standingWoman.svg" onLoad={() => setLoadPage(prevstate => prevstate + 1)} id="" className={` mobile-standing-women ${mobileWomanStanding} `} draggable={false} />
    <img alt="" src="/images/mobile/sittignWindowWoman.svg" id="" onLoad={() => setLoadPage(prevstate => prevstate + 1)} className={` mobile-sitting-window-women ${mobileWomanSittingWindow} `} draggable={false} />
    <img alt="" src="/images/animations/OrganizationBubble2.svg" id="" onLoad={() => setLoadPage(prevstate => prevstate + 1)} className={` mobile-oval2 ${mobileOval2Class} `} draggable={false} />
  </div>

  //* if mobile we dont want fade on the whole page, only on  some specific content
  switch (usersStore.currentPage) {
    case PAGE_NUMBERS.INTRODUCTION_PAGE:

      page = <IntroductionPage nextPageMobile={nextPageMobile} mobileAllButton={mobileAllButton} addOneToLoaded={addOneToLoaded} background="/images/backgrounds/IntroductionNoBubbles.svg" nextPage={nextPage} className={`${loadPage && 'fade-in'}`} />
      break;
    case PAGE_NUMBERS.ORGANIZATION_PAGE:

      page = <OrganizationFormPage nextPageMobile={nextPageMobile} mobileAllButton={mobileAllButton} background="/images/backgrounds/organizationFormNoBubbles.svg" setOvalAnimation2={setOvalAnimation2} nextPage={nextPage} className={!isMobileOnly && "fade-in"} />
      break;
    case PAGE_NUMBERS.PERSONAL_DATA_PAGE:


      page = <PersonalDataPage nextPageMobile={nextPageMobile} mobileAllButton={mobileAllButton} background="/images/backgrounds/PersonalDataNoBubbles.svg" nextPage={nextPage} setOvalAnimation2={setOvalAnimation2} setOvalAnimation2FadeOut={setOvalAnimation2FadeOut} className={!isMobileOnly && "fade-in"} />
      break;
    case PAGE_NUMBERS.SECTOR_PAGE:

      page = <SectorFormPage nextPageMobile={nextPageMobile} mobileAllButton={mobileAllButton} background="/images/backgrounds/SectorForm.svg" nextPage={nextPage} />
      break;
    case PAGE_NUMBERS.INSTRUCTION_PAGE:

      page = <InstructionsPage nextPageMobile={nextPageMobile} mobileAllButton={mobileAllButton} background="/images/backgrounds/Instructions_no_leafs.svg" className={!isMobileOnly && "fade-in"} setPhoneFade={setPhoneFade} />
      break;

    default:
      page = <IntroductionPage background="/images/backgrounds/Introduction.png" mobileAllButton={mobileAllButton} nextPage={nextPage} /> // for now
      break;
  }
  return (
    <div>
      <BrowserTabletView ><img alt="" src="/logos/new_logo.png" onLoad={() => setLoadPage(prevstate => prevstate + 1)} id="top-right-logo" draggable={false} /></BrowserTabletView>
      <div className="phone-container" id={isMobileOnly ? `mobile-container` : "browser-container"}>
        <BrowserTabletView >
          <img alt="" src="/images/png_phone.png"
            id={`phone-fake-image`}
            className={` ${handleLoadPage() ? 'fade-in' : 'hide-shape'} ${phoneFade}`}
            draggable={false}
            onLoad={() => setLoadPage(prevstate => prevstate + 1)} />
        </BrowserTabletView>
        <MobileOnlyView>
          {mobileAnimationsAllPages}
        </MobileOnlyView>
        {handleLoadPage() ? <> {page}  {(usersStore.currentPage === 1 || usersStore.currentPage === 2) && !isMobileOnly ? ovalImgOrgAndPersonal : ''}    </> : <div id="phone-center-loader-container" > <Loader /> </div>}


      </div>
    </div>
  );
}

export default observer(PhoneCenterPage);
