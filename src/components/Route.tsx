import React, {FC} from "react";
import {BrowserRouter as Router, Navigate, Route, Switch} from "react-router-dom";
import AuthForm from "./AuthForm.tsx";
import ProtectedRoute from "./ProtectedRoute.tsx";
import PasswordResetPage from "./PasswordResetPage.tsx";
import NoAccessPage from "./NoAccessPage.tsx";
import AccountDisabledPage from "./AccountDisabledPage.tsx";
import Dashboard from "./Dashboard.tsx";
import EventManagement from "./EventManagement.tsx";
import AttendeeManagement from "./AttendeeManagement.tsx";
import VoucherManagement from "./VoucherManagement.tsx";
import Reports from "./Reports.tsx";
import UserManagement from "./UserManagement.tsx";
import SubsidiaryManagement from "./SubsidiaryManagement.tsx";
import { Subsidiary, SubsidiaryEmployee, User} from "../types/index.ts";


export const Routes: FC = () => {
    return (

        <Router>


            <Switch>
                <Route path="/login">
                    <AuthForm/>
                </Route>

                <Route path="/reset-password">

                    <PasswordResetPage/>
                </Route>

                <Route path="/no-access" element={
                    <ProtectedRoute>

                        <NoAccessPage/>
                    </ProtectedRoute>

                }/>
                <Route path="/account-disabled" element={<AccountDisabledPage/>}/>
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <Dashboard events={displayEvents} attendees={displayAttendees}
                                   vouchers={displayVouchers}/>
                    </ProtectedRoute>

                }/>
                <Route path="/events" element={
                    <ProtectedRoute>

                        <EventManagement
                            events={displayEvents}
                            attendees={displayAttendees}
                            onCreateEvent={handleCreateEvent}
                            onUpdateEvent={handleUpdateEvent}
                            onDeleteEvent={handleDeleteEvent}
                        />
                    </ProtectedRoute>
                }/>
                <Route path="/attendees" element={
                    <ProtectedRoute>

                        <AttendeeManagement
                            events={displayEvents}
                            attendees={displayAttendees}
                            vouchers={displayVouchers}
                            onRegisterAttendee={handleRegisterAttendee}
                            onApproveRegistration={handleApproveRegistration}
                            onRejectRegistration={handleRejectRegistration}
                            userRole={user?.role || 'internal'}
                        />
                    </ProtectedRoute>
                }/>
                <Route path="/vouchers" element={
                    <ProtectedRoute>
                        <VoucherManagement events={[]} attendees={[]} vouchers={[]}
                                           onClaimDrink={function (voucherId: string, drinkType: "soft" | "hard", itemName?: string): void {
                                               throw new Error("Function not implemented.");
                                           }} userRole={"admin"}
                        />
                    </ProtectedRoute>
                }/>
                <Route path="/reports" element={
                    <ProtectedRoute>
                        <Reports events={[]} attendees={[]} vouchers={[]}/>
                    </ProtectedRoute>
                }/>
                <Route path="/users" element={
                    <ProtectedRoute requiredRole="admin">
                        <UserManagement events={[]}
                                        onCreateUser={function (user: Omit<User, "id" | "createdAt" | "createdBy">): void {
                                            throw new Error("Function not implemented.");
                                        }}
                                        onUpdateUserStatus={function (userId: string, status: "active" | "disabled"): void {
                                            throw new Error("Function not implemented.");
                                        }} onUpdateUser={function (userId: string, userData: Partial<User>): void {
                            throw new Error("Function not implemented.");
                        }}
                        />
                    </ProtectedRoute>
                }/>
                <Route path="/subsidiaries" element={
                    <ProtectedRoute requiredRole="admin">
                        <SubsidiaryManagement
                            onCreateSubsidiary={function (subsidiary: Omit<Subsidiary, "id" | "createdAt" | "createdBy">): void {
                                throw new Error("Function not implemented.");
                            }} onUpdateSubsidiary={function (id: string, subsidiary: Partial<Subsidiary>): void {
                            throw new Error("Function not implemented.");
                        }} onDeleteSubsidiary={function (id: string): void {
                            throw new Error("Function not implemented.");
                        }}
                            onUploadEmployees={function (subsidiaryId: string, employees: Omit<SubsidiaryEmployee, "id" | "subsidiaryId" | "createdAt" | "uploadedBy">[]): void {
                                throw new Error("Function not implemented.");
                            }}
                        />
                    </ProtectedRoute>
                }/>
                <Route path="*" element={<Navigate to="/dashboard" replace/>}/>


            </Switch>
        </Router>
    );
};
