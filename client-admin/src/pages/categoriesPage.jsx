import React, { useEffect } from "react";
import '../consts/class_names.scss';
import './categoriesPage.scss'
import AllCategories from "../components/categories/allCategories";
import SpecificCategory from "../components/categories/specificCategory";
import { observer } from "mobx-react-lite";
import { useSuperAdminStore } from "../stores/index.store";

function CategoriesPage(props) {
    const superAdminStore = useSuperAdminStore()
    async function fetchCategories() {
        await superAdminStore.fetchCategoriesAndIds();
    }
    useEffect(() => {
        fetchCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    let component;
    switch (superAdminStore.currentCategoryComponent) {
        case 0:
            component = <AllCategories />
            break;
        case 1:
            component = <SpecificCategory />
            break;
        default:
            break;
    }

    return (
        <div id="categories-page-container" className="width85">
            {component}
        </div>
    )
}

export default observer(CategoriesPage);