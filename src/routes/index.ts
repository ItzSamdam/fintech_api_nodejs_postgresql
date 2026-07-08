import UserAdminRoutes from "@/routes/admin-routes/admin-user-routes";
import WalletAdminRoutes from "@/routes/admin-routes/wallet-routes";
import TransactionAdminRoutes from "@/routes/admin-routes/transfer-routes";
import SystemAdminRoutes from "@/routes/admin-routes/system-routes";
import RoleAdminRoutes from "@/routes/admin-routes/role-routes";
import ReportAdminRoutes from "@/routes/admin-routes/report-routes";
import KYCAdminRoutes from "@/routes/admin-routes/kyc-routes";
import ProviderAdminRoutes from "@/routes/admin-routes/provider-routes";
const routesConfigs = [
    UserAdminRoutes,
    WalletAdminRoutes,
    TransactionAdminRoutes,
    SystemAdminRoutes,
    RoleAdminRoutes,
    ReportAdminRoutes,
    KYCAdminRoutes,
    ProviderAdminRoutes,
];

export default routesConfigs;