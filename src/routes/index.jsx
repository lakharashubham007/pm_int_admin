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

import ListProducts from "../pages/products/ListProducts";
import AddProduct from "../pages/products/AddProduct";
import EditProduct from "../pages/products/EditProduct";
import MasterManagement from "../pages/masters/MasterManagement";
import ListCategory from "../pages/category/ListCategory";
import CreateCategory from "../pages/category/CreateCategory";
import EditCategory from "../pages/category/EditCategory";
import ListSubcategory from "../pages/subcategory/ListSubcategory";
import ListBrand from "../pages/brand/ListBrand";
import ListUnit from "../pages/unit/ListUnit";
import ListTax from "../pages/tax/ListTax";
import ListVariantAttribute from "../pages/variant/ListVariantAttribute";
import ListVariantValue from "../pages/variant/ListVariantValue";
import ListVendor from "../pages/vendors/ListVendor";
import VendorAnalytics from "../pages/vendors/VendorAnalytics";
import AddVendor from "../pages/vendors/AddVendor";
import EditVendor from "../pages/vendors/EditVendor";

import VendorAddProduct from "../pages/vendors/products/VendorAddProduct";
import VendorProductList from "../pages/vendors/products/VendorProductList";
import VendorEditProduct from "../pages/vendors/products/VendorEditProduct";
import VendorOrders from "../pages/vendors/orders/VendorOrders";

import CMSPage from "../pages/CMS/CMSPage";
import HeroSection from "../pages/cms/HeroSection";
import AboutSection from "../pages/cms/AboutSection";
import GallerySection from "../pages/cms/GallerySection";
import ContactSection from "../pages/cms/ContactSection";
import ManageFacilities from "../pages/cms/ManageFacilities";
import ManageAdmissions from "../pages/cms/ManageAdmissions";
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

        // Products
        { url: "products/list-products", component: <ListProducts /> },
        { url: "products/add-product", component: <AddProduct /> },
        { url: "products/edit-product/:id", component: <EditProduct /> },
        { url: "products/master-management", component: <MasterManagement /> },
        { url: "categories", component: <ListCategory /> },
        { url: "categories/create-category", component: <CreateCategory /> },
        { url: "categories/edit-category/:id", component: <EditCategory /> },
        { url: "subcategories", component: <ListSubcategory /> },
        { url: "brands", component: <ListBrand /> },
        { url: "units", component: <ListUnit /> },
        { url: "taxes", component: <ListTax /> },
        { url: "variants", component: <ListVariantAttribute /> },
        { url: "variants/values/:attributeId", component: <ListVariantValue /> },

        // Vendors
        { url: "vendors/list-vendors", component: <ListVendor /> },
        { url: "vendors/analytics/:id", component: <VendorAnalytics /> },
        { url: "vendors/add-vendor", component: <AddVendor /> },
        { url: "vendors/edit-vendor/:id", component: <EditVendor /> },
        { url: "vendors/products/add", component: <VendorAddProduct /> },
        { url: "vendors/products/list", component: <VendorProductList /> },
        { url: "vendors/products/list/:vendorId", component: <VendorProductList /> },
        { url: "vendors/products/edit/:id", component: <VendorEditProduct /> },
        { url: "vendors/orders", component: <VendorOrders /> },
        { url: "orders", component: <VendorOrders /> },

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
