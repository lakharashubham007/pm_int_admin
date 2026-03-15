import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";

/// Layout
import MainLayout from '../layouts/MainLayout';
import Footer from '../layouts/Footer';
import ScrollToTop from '../layouts/ScrollToTop';

/// Pages
import Dashboard from "../pages/Dashboard";
import ListEmployee from "../pages/employee/ListEmployee";
import CreateEmployee from "../pages/employee/CreateEmployee";
import EditEmployee from "../pages/employee/EditEmployee";
import AccessControl from "../pages/AccessControl";
import Profile from "../pages/Profile";

import ListCategory from "../pages/category/ListCategory";
import CreateCategory from "../pages/category/CreateCategory";
import EditCategory from "../pages/category/EditCategory";
import CMSPage from "../pages/CMS/CMSPage";
import HeroSection from "../pages/CMS/HeroSection";
import AboutSection from "../pages/CMS/AboutSection";
import GallerySection from "../pages/CMS/GallerySection";
import ContactSection from "../pages/CMS/ContactSection";
import ManageFacilities from "../pages/CMS/ManageFacilities";
import ManageAdmissions from "../pages/CMS/ManageAdmissions";
import Settings from "../pages/settings/Settings";
import ComingSoon from "../pages/ComingSoon";


/// Error Pages (Stubs for now)
const Error404 = () => <div className="p-5"><h1>404</h1><p>Page Not Found</p></div>;

const Markup = () => {
    const allroutes = [
        /// Dashboard
        { url: "/", component: <Dashboard /> },
        { url: "dashboard", component: <Dashboard /> },

        // Profile
        { url: "profile", component: <Profile /> },

        // Employees (Staff)
        { url: "staff/list", component: <ListEmployee /> },
        { url: "staff/create", component: <CreateEmployee /> },
        { url: "admins/get-admins", component: <ListEmployee /> }, // Compatibility
        { url: "admins/create-admin", component: <CreateEmployee /> }, // Compatibility
        { url: "admins/edit-employee/:id", component: <EditEmployee /> },
        { url: "staff/edit/:id", component: <EditEmployee /> },
        { url: "employees/create", component: <CreateEmployee /> }, // Legacy support

        // Roles
        { url: "roles/access-control", component: <AccessControl /> },
        { url: "roles/get-roles", component: <AccessControl /> }, // Compatibility
        { url: "roles/create-role", component: <AccessControl /> }, // Compatibility

        // Categories
        { url: "categories", component: <ListCategory /> },
        { url: "categories/create-category", component: <CreateCategory /> },
        { url: "categories/edit-category/:id", component: <EditCategory /> },

        // CMS
        { url: "cms", component: <CMSPage /> },
        { url: "cms/hero", component: <HeroSection /> },
        { url: "cms/about", component: <AboutSection /> },
        { url: "cms/gallery", component: <GallerySection /> },
        { url: "cms/facilities", component: <ManageFacilities /> },
        { url: "cms/admissions", component: <ManageAdmissions /> },
        { url: "cms/contact", component: <ContactSection /> },


        // Programs (Coming Soon)
        { url: "programs/list", component: <ComingSoon title="Programs List" /> },
        { url: "programs/add", component: <ComingSoon title="Add New Program" /> },

        // Settings
        { url: "settings", component: <Settings /> },
    ]





    return (
        <>
            <Routes>
                <Route element={<MainLayout />} >
                    {allroutes.map((data, i) => (
                        <Route
                            key={i}
                            path={`${data.url}`}
                            element={data.component}
                        />
                    ))}
                </Route>
                <Route path='*' element={<Error404 />} />
            </Routes>
            <ScrollToTop />
            <Footer />
        </>
    )
}

export default Markup;
