import React, { useMemo, useState } from 'react';
import { AsyncTools } from "@hilma/tools";
import { useLogin } from "@hilma/auth";

import GeneralInput from "../generic-components/generalInput";
import { emailMsg, generalErrMsg, emailNotVerifiedMsg, wrongUsernameOrPass, somethingWentWrong } from '../consts/errMessages';
import { emailRegexp, passwordRegExp } from '../consts/regexp';
import { checkValidation } from '../consts/functions';
// import { useGenAlert } from '../context/generalAlertCtx';
import './login.scss';
// import Axios from 'axios';



const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailErrMsg, setEmailErrMsg] = useState("")
    const [errMsg, setErrMsg] = useState("");

    const login = useLogin();
    // const generalAlert = useGenAlert();

    const handleEmailChange = (e) => {
        const email = e.target.value;
        // if () {
        //     setDisableLogin(true)
        // }
        // else {
        setErrMsg("")
        //     setDisableLogin(false)
        // }
        setEmail(email);
    }

    const handlePasswordChange = (e) => {
        const ps = e.target.value;
        // if (ps && ps.length && !checkValidation(ps, passwordRegExp)) {
        //     setDisableLogin(true)
        // }
        // else {
        setErrMsg("")
        //     setDisableLogin(false)
        // }
        setPassword(ps);
    }

    const validatePassword = (pwd) => {
        if (pwd && !checkValidation(pwd, passwordRegExp)) {
            setErrMsg(wrongUsernameOrPass);
            return false;
        }
        setErrMsg('');
        return true
    }

    const validateEmail = (email) => {
        if (email && !checkValidation(email, emailRegexp)) {
            setEmailErrMsg(emailMsg);
            return false;
        }
        setEmailErrMsg('');
        return true
    }

    const handleLogin = (password, email) => async () => {
        if (!navigator.onLine) {
            setErrMsg('אין חיבור לאינטרנט')
            return
        }

        if (!email || !password) {
            setErrMsg(generalErrMsg);
            return;
        }

        // validate email
        const validEmail = validateEmail(email);
        if (!validEmail) {
            return
        }

        // validate password
        const validPwd = validatePassword(password);
        if (!validPwd) {
            return;
        }

        // login

        const [err, res] = await AsyncTools.to(
            login("/api/admin/admin-login", { username: email, password: password })
            // Axios.post("/api/admin/new-admin", { adminUser: { username: email, password: password }, role: "SUPERADMIN" })
        );

        if (err) {
            // generalAlert.openGenAlert({ text: somethingWentWrong, warning: true });
            setErrMsg(somethingWentWrong);
            return;
        }

        if (!res.success) {
            if (res.msg && res.msg.status && parseInt(res.msg.status) === 401) {
                const errCode = res.msg.data && res.msg.data.code && parseInt(res.msg.data.code);
                setErrMsg((errCode === 3 /* email not verified code */) ? emailNotVerifiedMsg : wrongUsernameOrPass)
                // generalAlert.openGenAlert({
                //     text: (errCode === 3 /* email not verified code */) ? emailNotVerifiedMsg : wrongUsernameOrPass
                //     , warning: true
                // });
            }
            else {
                // generalAlert.openGenAlert({ text: somethingWentWrong, warning: true });
                setErrMsg(somethingWentWrong)
            } return;
        }
    }

    const showErrMsg = useMemo(() => errMsg && typeof errMsg === "string", [errMsg]);

    const invalidEmail = useMemo(() => (!email || !email.length || !checkValidation(email, emailRegexp)), [email])
    const invalidPassword = useMemo(() => (!password || !password.length || !checkValidation(password, passwordRegExp)), [password])
    const validData = useMemo(() => !invalidEmail && !invalidPassword, [invalidEmail, invalidPassword])

    return (

        <div id="login-container">
            {/* background image */}
            <img id="bg-img" alt="" src="/backgrounds/login-bg.png" />

            {/* logo icon */}
            {/* <img id="israeldig-logo" alt="" src="/logos/israel_logo_white.gif" /> double logo */}

            <div id="content-container">
                <div id="header">מערכת ניהול</div>

                <div id="username-container">
                    <div className="input-header">כתובת מייל</div>
                    <GeneralInput inputClassNames="login-input" value={email} onChange={handleEmailChange} autoFocus errMsg={emailErrMsg} />
                </div>

                <div id="password-container">
                    <div className="input-header">סיסמה</div>
                    <GeneralInput inputClassNames="login-input" value={password} onChange={handlePasswordChange} type="password" />
                </div>

                <button id="login-btn" className={`${validData ? 'full-opacity clickable' : 'half-opacity'}`} onClick={handleLogin(password, email)} >כניסה</button>
                {showErrMsg ? <div className="err-msg">{errMsg}</div> : null}
            </div>
        </div >
    );
}

export default Login;