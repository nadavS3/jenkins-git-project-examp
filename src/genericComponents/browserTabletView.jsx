import React from "react";
import { isBrowser, CustomView, isTablet } from "react-device-detect";
const BrowserTabletView = ({ children }) => {
    return (
        <CustomView renderWithFragment={true} condition={isBrowser || isTablet} >{children}</CustomView>
    )
}

export default BrowserTabletView