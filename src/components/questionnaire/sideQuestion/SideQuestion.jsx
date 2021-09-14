import React from "react";
import "./SideQuestion.scss";
import SideQuestionInfo from "./SideQuestionInfo";
import QuestionsMenu from "../menu/QuestionsMenu";

function SideQuestion({ displayMenu, setDisplayMenu, activateFadeOutAndInitiateCB, submitAnswer }) {

  return (
    <div id="side-question-container" >
      <img alt="" src="/logos/new_logo.png" id="top-right-logo-side-phone" draggable={false} />
      {displayMenu ? <QuestionsMenu activateFadeOutAndInitiateCB={activateFadeOutAndInitiateCB} setDisplayMenu={setDisplayMenu} /> : <SideQuestionInfo setDisplayMenu={setDisplayMenu} submitAnswer={submitAnswer} activateFadeOutAndInitiateCB={activateFadeOutAndInitiateCB} />}
    </div>
  );
}

export default SideQuestion;
