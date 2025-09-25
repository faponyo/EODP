// import React from 'react'
// import {Route, RouteProps} from 'react-router-dom'
//
//
// export interface RoutesProps {
//     path: RouteProps['path']
//     name?: string
//     element?: RouteProps['element']
//     route?: any
//     exact?: boolean
//     icon?: string
//     header?: string
//     roles?: string[]
//     children?: RoutesProps[]
// }
//
// const PlaceholderComponent = ({name}: { name: string }) => (
//     <div>{`${name} Page`}</div>
// )
//
// const homePageRoutes: RoutesProps = {
//     path: '/dashboard',
//     name: 'Dashboard',
//     icon: 'home',
//     header: 'Navigation',
//     children: [
//         {
//             path: '/dashboard/home',
//             name: 'Dashboard',
//             element: <Dashboard/>,
//             route: PrivateRoute,
//         },
//
//         {
//             path: '',
//             name: 'Dashboard',
//             element: <Dashboard/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/role-creation',
//             name: 'Dashboard',
//             element: <CreateRolePage/>,
//             route: PrivateRoute,
//         },
//     ],
// }
//
// const usersRoutes: RoutesProps = {
//     path: '/users',
//     name: 'Users',
//     icon: 'ri-group-line',
//     header: 'Navigation',
//     children: [
//         {
//             path: '/users/manage',
//             name: 'Users',
//             element: <UserRecordsTable/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/user/create',
//             name: 'Create User',
//             element: <UserCreationForm/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/users/unapproved',
//             name: 'User Addition Approvals',
//             element: <UserApprovalTable/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/user/roles',
//             name: 'Roles',
//             element: <RoleManagement/>,
//             route: PrivateRoute,
//         },
//     ],
// }
//
// const shareHoldersRoutes: RoutesProps = {
//     path: '/shareholders',
//     name: 'shareholders',
//     icon: 'ri-team-fill',
//     header: 'Navigation',
//     children: [
//         {
//             path: '/shareholders/view',
//             name: 'View',
//             element: <AllShareholders/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/shareholders/view/:accountId',
//             name: 'View Details',
//             // element: <ShareHoldersMoreInfo/>,
//             element: <ShareHoldersMoreInfoWithTab/>,
//             route: PrivateRoute,
//         },
//
//         {
//             path: '/shareholders/add',
//             name: 'Add shareholders',
//             element: <AddShareHolderOperation/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/shareholders/edit/:accountId',
//             name: 'Edit shareholders',
//             element: <EditShareHolderOperation/>,
//             route: PrivateRoute,
//         },
//         // {
//         //     path: '/shareholders/file',
//         //     name: 'Add shareholders File',
//         //     element: <AddShareHolderByFile/>,
//         //     route: PrivateRoute,
//         // },
//         {
//             path: '/shareholders/pending',
//             name: 'shareholders-pending',
//             element: <PendingShareholders/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/shareholders/rejected',
//             name: 'shareholders-rejected',
//             element: <RejectedShareholders/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/shareholders/pending/file',
//             name: 'shareholders-pending-file',
//             element: <PendingUploadedShareholders/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/shareholders/approved/file',
//             name: 'shareholders-approved-file',
//             element: <ApprovedUploadedShareholders/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/shareholders/rejected/file',
//             name: 'shareholders-rejected-file',
//             element: <RejectedUploadedShareholders/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/shareholders/add',
//             name: 'Add shareholders',
//             element: <AddShareHolderOperation/>,
//             route: PrivateRoute,
//         },
//         // {
//         //     path: '/shareholders/file',
//         //     name: 'Add shareholders File',
//         //     element: <AddShareHolderByFile/>,
//         //     route: PrivateRoute,
//         // },
//         {
//             path: '/shareholders/pending',
//             name: 'shareholders-pending',
//             element: <PendingShareholders/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/shareholders/rejected',
//             name: 'shareholders-rejected',
//             element: <RejectedShareholders/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/shareholders/pending/file',
//             name: 'shareholders-pending-file',
//             element: <PendingUploadedShareholders/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/shareholders/approved/file',
//             name: 'shareholders-approved-file',
//             element: <ApprovedUploadedShareholders/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/shareholders/rejected/file',
//             name: 'shareholders-rejected-file',
//             element: <RejectedUploadedShareholders/>,
//             route: PrivateRoute,
//         },
//
//         {
//             path: '/shareholders/manage',
//             name: 'shareholders',
//             element: <ShareholderManager/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/shareholders/upload/cdsc',
//             name: 'CDSC Upload Files',
//             element: <CdscFiles/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/shareholders/approvals',
//             name: 'Pending Approvals',
//             element: <ShareholderDataApproval/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/user/approvals',
//             name: 'User Addition Approvals',
//             element: <UserApprovalTable/>,
//             route: PrivateRoute,
//         },
//     ],
// }
//
// const organisationRoutes: RoutesProps = {
//     path: '/issuers',
//     name: 'Issuers',
//     icon: 'ri-team-fill',
//     header: 'Navigation',
//     children: [
//         {
//             path: '/issuers/manage',
//             name: 'issuers-management',
//             // element: <OrganisationManager />,
//             element: <ViewOrganisationTable/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/issuers/add',
//             name: 'Issuer addition.',
//             element: <CreateOrganization/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/issuers/update',
//             name: 'issuer-update',
//             element: <UpdateOrganization/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/issuers/shareholder-modify',
//             name: 'issuers-management',
//             element: <ShareholderUpdate/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/issuers/org-approval',
//             name: 'issuer-pending-approvals',
//             // element: <OrganisationApproval />,
//             element: <PendingOrganisationTable/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/issuers/org-rejected',
//             name: 'issuer-rejected',
//             // element: <OrganisationApproval />,
//             element: <RejectedOrganisationTable/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/issuers/shareholders-approval',
//             name: 'issuers-management',
//             element: <OrgShareholderApprovals/>,
//             route: PrivateRoute,
//         },
//     ],
// }
//
// const configRoutes: RoutesProps = {
//     path: '/cdsc',
//     name: 'Cdsc',
//     icon: 'ri-folder-5-fill',
//     header: 'Navigation',
//     children: [
//         {
//             path: '/audit/logs',
//             name: 'Audit Logs',
//             element: <AuditLogsComponent/>,
//             route: PrivateRoute,
//         },
//     ],
// }
//
// const cdscRoutes: RoutesProps = {
//     path: '/cdsc',
//     name: 'Cdsc',
//     icon: 'ri-folder-5-fill',
//     header: 'Navigation',
//     children: [
//         {
//             path: '/cdsc/files',
//             name: 'Cdsc Files',
//             element: <AllCdscFiles/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/cdsc/files/upload',
//             name: 'Cdsc Files Upload',
//             element: <UploadCdscFile/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/cdsc/files/:cdscFileId',
//             name: 'Cdsc Files Details',
//             element: <CdscDataInfo/>,
//             route: PrivateRoute,
//         },
//
//
//         {
//             path: '/cdsc/approvals',
//             name: 'Approvals',
//             element: <MdOutlineManageAccounts/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/cdsc/uploads',
//             name: 'Uploads',
//             element: <FileUploadForm/>,
//             route: PrivateRoute,
//         },
//     ],
// }
//
//
// const reconRoutes: RoutesProps = {
//     path: '/recon',
//     name: 'Reconciliation',
//     icon: 'ri-folder-5-fill',
//     header: 'Navigation',
//     children: [
//         {
//             path: '/recon/files/upload',
//             name: 'Reconciliation',
//             element: <UploadReconFiles/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/recon/files',
//             name: 'Reconciliation',
//             element: <ReconFiles/>,
//             route: PrivateRoute,
//         },
//
//     ],
// }
//
// const paymentsRoutes: RoutesProps = {
//     path: '/payments',
//     name: 'Payments',
//     icon: 'ri-bank-card-fill',
//     header: 'Navigation',
//     children: [
//         {
//             path: '/payments/channels',
//             name: 'Channels',
//             element: <Channels withCustomSearch={true}/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/payments/accounts',
//             name: 'System Accounts',
//             element: <BankAccounts withCustomSearch={true}/>,
//             route: PrivateRoute,
//         },
//
//         {
//             path: '/payments/all',
//             name: 'Payments',
//             element: <Payment/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/payments/upload/cdsc',
//             name: 'CDSC Upload Files',
//             element: <CdscFiles/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/payments/cheques',
//             name: 'Cheques',
//             element: <ChequeSchedule/>,
//             route: PrivateRoute,
//         },
//
//         {
//             path: '/payments/cheques/pending-first-approval',
//             name: 'ChequesPendingFirstApproval',
//             element: <ChequesFirstApproval/>,
//             route: PrivateRoute,
//         },
//
//         {
//             path: '/payments/cheques/status-update',
//             name: 'ChequesStatusUpdate',
//             element: <ChequesStatusUpdate/>,
//             route: PrivateRoute,
//         },
//
//
//         {
//             path: '/payments/cheques/pending-second-approval',
//             name: 'ChequesPendingSecondApproval',
//             element: <ChequesSecondApproval/>,
//             route: PrivateRoute,
//         },
//
//
//         {
//             path: '/payments/cheques/approved',
//             name: 'ApprovedCheques',
//             element: <ApprovedCheques/>,
//             route: PrivateRoute,
//         },
//
//
//         {
//             path: '/vendor/details',
//             name: 'VendorDetails',
//             element: <VendorDetails/>,
//             route: PrivateRoute,
//         },
//
//         {
//             path: '/approve/vendor/details',
//             name: 'ApproveVendorDetails',
//             element: <ApproveVendorDetails/>,
//             route: PrivateRoute,
//         },
//
//         {
//             path: '/rejected/vendor/details',
//             name: 'RejectedVendorDetails',
//             element: <RejectedVendorDets/>,
//             route: PrivateRoute,
//         },
//
//         {
//             path: '/payments/cheques/rejected',
//             name: 'RejectedCheques',
//             element: <RejectedCheques/>,
//             route: PrivateRoute,
//         },
//
//         {
//             path: '/payments/class-a-payments',
//             name: 'Payments',
//             element: <ShareholderPayment/>,
//             route: PrivateRoute,
//         },
//
//         {
//             path: 'payments/calculate',
//             name: 'Payments',
//             element: <PaymentCalculations/>,
//             route: PrivateRoute,
//         },
//
//         {
//             path: 'payment/calculate',
//             name: 'Payments',
//             element: <Calculate2/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/payments/schedule',
//             name: 'Pay Schedules',
//             element: <ShareholderPayment/>,
//             route: PrivateRoute,
//         },
//
//         {
//             path: '/payments/reports',
//             name: 'Reports',
//             element: <PaymentReportTypePage title={"Payment Reports"} subName={"Payments"}/>,
//             route: PrivateRoute,
//         },
//
//         {
//             path: '/payments/failed',
//             name: 'Reports',
//             element: <RepaymentPayment/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/payments/dividends-notice',
//             name: 'Reports',
//             element: <DividendsNotice/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/payments/reports/:reportType',
//             name: 'Reports',
//             element: <PaymentReportsOverviewPage/>,
//             route: PrivateRoute,
//         },
//
//
//         {
//             path: '/certificates/approvals',
//             name: 'Certificate Management',
//             element: <CertificateActionsApproval/>,
//             route: PrivateRoute,
//         },
//
//         {
//             path: '/certificates/rejected',
//             name: 'Certificate Management',
//             element: <RejectedActionCertificate/>,
//             route: PrivateRoute,
//         },
//         {
//             path: 'certificates/approved-printouts',
//             name: 'Certificate Management',
//             element: <CertificatePrintoutsApproval/>,
//             route: PrivateRoute,
//         },
//
//
//         {
//             path: '/certificates/rejected',
//             name: 'Certificate Management',
//             element: <RejectedActionCertificate/>,
//             route: PrivateRoute,
//         },
//
//         {
//             path: '/certificates/merge',
//             name: 'Certificate Management',
//             element: <CertificateManager/>,
//             route: PrivateRoute,
//         },
//
//         {
//             path: '/certificates/design',
//             name: 'Certificate Management',
//
//             element: <CertificateTemplateModifier/>,
//             route: PrivateRoute,
//         },
//
//         {
//             path: '/payments/feedback',
//             name: 'Payments Feedbacks',
//             element: <PlaceholderComponent name="failed"/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/payments/channels',
//             name: 'Payment Channels',
//             element: <PaymentChannelManager/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/payments/rates',
//             name: 'Rates',
//             element: <RateManager/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/payments/approvals',
//             name: 'Payment Approvals',
//             element: <PaymentApproval/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/payments/scheduler',
//             name: 'Payment Scheduler',
//             element: <PaymentScheduler/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/payments/scheduler/:scheduleId',
//             name: 'Payment Details',
//             element: <PaymentDataInfo/>,
//             route: PrivateRoute,
//         },
//
//         {
//             path: '/issuer/cheques/:scheduleId',
//             name: 'Payment Details',
//             element: <ChequeDataInfo/>,
//             route: PrivateRoute,
//         },
//     ],
// }
// const chequeRoutes: RoutesProps = {
//     path: '/Cheques',
//     name: 'Cheques',
//     icon: 'ri-bank-card-fill',
//     header: 'Navigation',
//     children: [
//         {
//             path: '/Cheques/all',
//             name: 'Cheques',
//             element: <ChequeSchedule/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/Cheques/pending-first-approval',
//             name: 'ChequesPendingFirstApproval',
//             element: <ChequesFirstApproval/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/Cheques/pending-second-approval',
//             name: 'ChequesPendingSecondApproval',
//             element: <ChequesSecondApproval/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/Cheques/rejected',
//             name: 'RejectedCheques',
//             element: <RejectedCheques/>,
//             route: PrivateRoute,
//         },
//
//         {
//             path: '/Cheques/mailing',
//             name: 'Mailing Tracker',
//             element: <ChequeManager/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/Cheques/approvals',
//             name: 'Approvals',
//             element: <ChequeApprovalManager showApproval={true}/>,
//             route: PrivateRoute,
//         },
//     ],
// }
//
// const sharesMaintenanceRoutes: RoutesProps = {
//     path: '/shares',
//     name: 'Shares Maintenance',
//     icon: 'ri-award-line',
//     header: 'Navigation',
//     children: [
//         {
//             path: '/shares/transactions',
//             name: 'Transactions',
//             element: <AllTransactions/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/shares/manage',
//             name: 'Shares',
//             element: <TransactionApproval/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/shares/transfers',
//             name: 'Transfers',
//             element: <ShareTransfer/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/shares/additions',
//             name: 'Addition',
//             element: <ShareAddition/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/shares/subtraction',
//             name: 'Subtraction',
//             element: <SharesSubtraction/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/shares/allotment',
//             name: 'Allotment',
//             element: <SharesAllotment/>,
//             route: PrivateRoute,
//         },
//         {
//             path: '/shares/transformation',
//             name: 'Transformation',
//             element: <Transformation/>,
//             route: PrivateRoute,
//         },
//         // {
//         //     path: '/shares/bonds',
//         //     name: 'Bond Holders',
//         //     element: <CertificateManager/>,
//         //     route: PrivateRoute,
//         // },
//     ],
// }
//
//
// // dashboards
// const issuersRoutes: RoutesProps = {
//     path: '/issuers',
//     name: 'Issuers',
//     icon: 'ri-arrow-up-circle-line',
//     header: 'Navigation',
//     children: [
//         {
//             path: '/issuers/orgs',
//             name: 'Issuers',
//             element: <IssuersOrg/>,
//             route: PrivateRoute,
//         },
//     ],
// }
//
// // auth
// const authRoutes: RoutesProps[] = [
//     {
//         path: '/login',
//         name: 'Login',
//         element: <Login/>,
//         route: Route,
//     },
//     {
//         path: '/2fa/verify',
//         name: 'Otp',
//         element: <Otp/>,
//         route: Route,
//     },
//     {
//         path: '/',
//         name: 'Home',
//         element: <Login/>,
//         route: Route,
//     },
//     {
//         path: '/logout',
//         name: 'Logout',
//         element: <Logout/>,
//         route: Route,
//     },
// ]
//
// // public routes
// const otherPublicRoutes = [
//     {
//         path: '*',
//         name: 'Error - 404',
//         element: <Error404/>,
//         route: Route,
//     },
//     {
//         path: 'pages/error-404',
//         name: 'Error - 404',
//         element: <Error404/>,
//         route: Route,
//     },
//     {
//         path: 'pages/error-500',
//         name: 'Error - 500',
//         element: <Error500/>,
//         route: Route,
//     },
// ]
//
// // flatten the list of all nested routes
// const flattenRoutes = (routes: RoutesProps[]) => {
//     let flatRoutes: RoutesProps[] = []
//
//     routes = routes || []
//     routes.forEach((item: RoutesProps) => {
//         flatRoutes.push(item)
//         if (typeof item.children !== 'undefined') {
//             flatRoutes = [...flatRoutes, ...flattenRoutes(item.children)]
//         }
//     })
//     return flatRoutes
// }
//
// // All routes
// const authProtectedRoutes = [
//     homePageRoutes,
//     issuersRoutes,
//     usersRoutes,
//     shareHoldersRoutes,
//     organisationRoutes,
//     configRoutes,
//     cdscRoutes,
//     paymentsRoutes,
//     chequeRoutes,
//     sharesMaintenanceRoutes,
//     reconRoutes
// ]
// const publicRoutes = [...authRoutes, ...otherPublicRoutes]
//
// const authProtectedFlattenRoutes = flattenRoutes([...authProtectedRoutes])
// const publicProtectedFlattenRoutes = flattenRoutes([...publicRoutes])
// export {
//     publicRoutes,
//     authProtectedRoutes,
//     authProtectedFlattenRoutes,
//     publicProtectedFlattenRoutes,
// }
