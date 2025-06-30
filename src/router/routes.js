import DashboardLayout from "@/layout/dashboard/DashboardLayout.vue";
import LoginLayout from "@/layout/dashboard/LoginLayout.vue";
// GeneralViews
import NotFound from "@/pages/NotFoundPage.vue";

// Admin pages
import Dashboard from "@/pages/Dashboard.vue";
import UserProfile from "@/pages/UserProfile.vue";
import Notifications from "@/pages/Notifications.vue";
import Icons from "@/pages/Icons.vue";
import Maps from "@/pages/Maps.vue";
import Typography from "@/pages/Typography.vue";
import Clients from "@/pages/Clients.vue";
import Transaction from "@/pages/Transaction.vue";
import Reports from "@/pages/Report.vue";
import Services from "@/pages/Service.vue";
import ServicesCat from "@/pages/ServiceCat.vue";
import ScheduleAvailability from "@/pages/ScheduleAvailability.vue";


import Appointments from "@/pages/Appointment.vue";
import Transactions from "@/pages/Transactions.vue";
import Dtr from "@/pages/Dtr.vue";
import DtrManager from "@/pages/DtrManager.vue";
import DtrView from "@/pages/DtrView.vue";
import Expenses from "@/pages/Expenses.vue";
import Users from "@/pages/User.vue";
import UserPermission from "@/pages/UserPermission.vue";
import Settings from "@/pages/Settings.vue";

import UpdateBusiness from "@/layout/dashboard/UpdateBusiness.vue";


import AppointmentLayout from "@/layout/dashboard/AppointmentLayout.vue";
import LandingLayout from "@/layout/dashboard/LandingPageLayout.vue";
import RegisterLayout from "@/layout/dashboard/RegisterLayout.vue";
import ForgotLayout from "@/layout/dashboard/ForgotLayout.vue";
import ResetLayout from "@/layout/dashboard/ResetLayout.vue";
import TodaysAppointment from "@/layout/dashboard/TodaysAppointment.vue";
import ConfirmAppointment from "@/layout/dashboard/ConfirmAppointment.vue";
import SubscriptionLayout from "@/layout/dashboard/SubscriptionLayout.vue";
import CheckoutLayout from "@/layout/dashboard/CheckoutLayout.vue";
import PaypalSuccess from "@/layout/dashboard/PaypalSuccess.vue";
import PaypalCancel from "@/layout/dashboard/PaypalCancel.vue";


const routes = [
  {
    path: "/",
    component: DashboardLayout,
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        name: "dashboard",
        component: Dashboard,
        meta: {
          requiredPermission: "view_dashboard" 
        }
      },
      {
        path: "clients",
        name: "clients",
        component: Clients,
        meta: {
          requiredPermission: "view_clients"  
        }
      },
      {
        path: "transaction/:id",
        name: "transaction",
        component: Transaction,
        meta: {
          requiresAuth: true 
        }
      },
      {
        path: "appointments",
        name: "appointments",
        component: Appointments,
        meta: {
          requiredPermission: "view_appointments"  
        }
      },
      {
        path: "reports",
        name: "reports",
        component: Reports,
        meta: {
          requiredPermission: "view_reports"
        }
      },
      {
        path: "services",
        name: "services",
        component: Services,
        meta: {
          requiredPermission: "view_services"
        }
      },
      {
        path: "services-cat",
        name: "services Category",
        component: ServicesCat,
        meta: {
          requiredPermission: "view_category_services"
        }
      },
      {
        path: "availability",
        name: "Availability",
        component: ScheduleAvailability,
        meta: {
          requiredPermission: "view_availability"
        }
      },
      {
        path: "users",
        name: "users",
        component: Users,
        meta: {
          requiredPermission: "view_users"
        }
      },
      {
        path: "profile",
        name: "profile",
        component: UserProfile,
      },
      {
        path: "user-permission",
        name: "User Permission",
        component: UserPermission,
        meta: {
          requiredPermission: "view_permissions"
        }
      },
      {
        path: "transactions",
        name: "transactions",
        component: Transactions,
        meta: {
          requiredPermission: "view_transactions"
        }
      },{
        path: "dtr",
        name: "dtr",
        component: Dtr,
        meta: {
          requiresAuth: true 
        }
      },{
        path: "dtr-manager",
        name: "dtr manager",
        component: DtrManager,
        meta: {
          requiresAuth: true,
          requiresAdmin: true   
        }
      },{
        path: "/dtr/:id",
        name: "dtr view",
        component: DtrView,
        meta: {
          requiresAuth: true,
          requiresAdmin: true   
        }
      },{
        path: "settings",
        name: "settings",
        component: Settings,
        meta: {
          requiredPermission: "view_settings"
        }
      }
      ,{
        path: "expenses",
        name: "expenses",
        component: Expenses,
        meta: {
          requiresAuth: true,
          requiresAdmin: true   
        }
      },{
        path: '/admin/appointments/confirm/:id',
        name: "Confirm Appointment",
        component: ConfirmAppointment,
      }
      ,{
        path: '/notifications',
        name: "notifications",
        component: Notifications,
      }
      
    ],
  },
  {
    path: "/login",
    component: LoginLayout,
    name: "login",

  },
  {
    path: "/book/:id",
    component: AppointmentLayout,
    name: "appointment",
    props: true, // optional, allows passing the route param as a prop
  },  
  {
    path: "/business/:id",
    component: LandingLayout,
    name: "business",
    props: true, // optional, allows passing the route param as a prop
  },
  {
    path: "/register",
    component: RegisterLayout,
    name: "Register",

  },
  {
    path: "/forget",
    component: ForgotLayout,
    name: "Forgot Password",

  },
  {
    path: '/password/reset/:token',
    name: 'ResetPassword',
    component: ResetLayout,
  },
  {
    path: "/books",
    component: TodaysAppointment,
    name: "todaysappointment",

  }
  ,{
    path: "/update-business",
    name: "update business",
    component: UpdateBusiness,
  },
  {
    path: "/subscription",
    name: "subscription",
    component: SubscriptionLayout,
  },
  {
    path: "/checkout/:id",
    name: "checkout",
    component: CheckoutLayout,
  },
  {
    path: "/paypal-success",
    name: "paypal success",
    component: PaypalSuccess,
  },
  {
    path: "/paypal-cancel",
    name: "paypal cancel",
    component: PaypalCancel,
  },
  { path: "*", name: "not-found", component: NotFound },
];



/**
 * Asynchronously load view (Webpack Lazy loading compatible)
 * The specified component must be inside the Views folder
 * @param  {string} name  the filename (basename) of the view to load.
function view(name) {
   var res= require('../components/Dashboard/Views/' + name + '.vue');
   return res;
};**/

export default routes;
