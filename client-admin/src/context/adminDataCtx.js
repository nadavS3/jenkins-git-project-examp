import React, { useContext, useState } from 'react';

const adminDataContext = React.createContext()

export const useAdminData = () => useContext(adminDataContext)

export const AdminDataProvider = ({ children }) => {

    const [adminRole, setAdminRole] = useState(false);
    const [adminOrganizationData, setAdminOrganizationData] = useState({});
    const isSuperAdmin = () => {
        let bool;
        adminRole === "SUPERADMIN" ? bool = true : bool = false;
        return bool
    }
    const ctxValue = {
        adminRole, setAdminRole, adminOrganizationData, setAdminOrganizationData, isSuperAdmin,
    }

    return < adminDataContext.Provider value={ctxValue} >
        {children}
    </adminDataContext.Provider>
}