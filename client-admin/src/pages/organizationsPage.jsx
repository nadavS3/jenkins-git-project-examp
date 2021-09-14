import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useSuperAdminStore } from "../stores/index.store";
import AllOrganizations from "../components/organizations/allOrganizations";

function OrganizationsPage(props) {
    const superAdminStore = useSuperAdminStore()
    useEffect(() => {
        async function fetchCategories() {
            superAdminStore.fetchOrganizationsAndIds();
        }
        fetchCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    return (
        <div id="organizations-page-container" className="width85">
            <AllOrganizations />
        </div>
    )
}

export default observer(OrganizationsPage);