import React, {useEffect, useMemo, useState} from 'react';
import {Download} from 'lucide-react';
import {PaginationProps} from '../types';
import {usePagination} from '../hooks/usePagination';
import eventService from "../services/Events.ts";
import checkInService from "../services/CheckIn.ts";
import reportsService from "../services/Report.ts";

import EPagination from "../common/EPagination.tsx";
import OverlayLoader from "./OverlayLoader.tsx";
import {showError, showInfo} from "../common/Toaster.ts";
import {useAuthContext} from "../common/useAuthContext.tsx";
import {PERMISSIONS} from "../common/constants.ts";


const Reports: React.FC = () => {
    const [selectedReport, setSelectedReport] = useState('overview');
    const [selectedEvent, setSelectedEvent] = useState('');
    const [events, setEvents] = useState<Record[]>([]);
    const [attendees, setAttendees] = useState<Record[]>([]);
    const [vouchers, setVouchers] = useState<Record[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(5);
    const {hasPermission} = useAuthContext();

    const [loadingData, setLoadingData] = useState<boolean>(false);
    const [pagination, setPagination] = useState<PaginationProps>({
        number: 1,
        size: 5,
        totalElements: 0,
        totalPages: 0,
        items: 0

    });
    const [downloadData, setDownloadData] = useState<boolean>(false)


    const fetchEventWithVoucherData = async () => {

        setEvents([])

        await eventService.getEventsWithVouchers(

        ).then(
            data => {

                setEvents(data)


            }
        ).catch(error => {
            console.log(error)


        });
    }


    const fetchEventsWithAttendees = async () => {
        setEvents([])

        await eventService.getEventsWithAttendees().then(
            data => {
                setEvents(data)
            }
        ).catch(error => {
            console.log(error)

        });
    }


    useEffect(() => {

        setEvents([])
        if (selectedReport === 'attendees') {
            fetchEventsWithAttendees()
        } else if (selectedReport === 'vouchers') {
            fetchEventWithVoucherData()
        }

    }, [selectedReport]);


    useEffect(() => {
        setAttendees([])
        setVouchers([]);
        if ((selectedReport === 'attendees' || selectedReport === 'vouchers') && !(selectedEvent == undefined || selectedEvent === '')) {
            if (selectedReport === 'attendees') {

                fetchAttendeeData(currentPage, pageSize, selectedEvent, undefined, undefined)
            } else if (selectedReport === 'vouchers') {
                fetchVoucherData(currentPage, pageSize, selectedEvent)
            }
        }

    }, [selectedReport, selectedEvent, currentPage, pageSize]);

    const updateVoucherData = (content: never[], page: number, size: number, totalPages: number, totalElements: number,) => {
        setVouchers(content)
        setPagination({
            number: page,
            size: size,
            totalElements: totalElements,
            totalPages: totalPages,

        })
    }

    const fetchVoucherData = async (page: number, pageSize: number, eventId: never) => {
        setLoadingData(true)
        setCurrentPage(page)


        await checkInService.getVouchersPaginated(page, pageSize, eventId, undefined, undefined).then(
            data => {
                const {content, page: {number, size, totalPages, totalElements}} = data
                updateVoucherData(content, page, size, totalPages, totalElements)


                setLoadingData(false)


            }
        ).catch(error => {
            console.log(error)
            setLoadingData(false)


        });
    }


    const fetchAttendeeData = async (page: number, pageSize: number, eventId: string, selectedFilterBy, filterValue) => {
        setLoadingData(true)

        setCurrentPage(page)
        await checkInService.getAttendeesPaginated(page, pageSize, eventId, selectedFilterBy, filterValue).then(
            data => {
                const {content, page: {number, size, totalPages, totalElements}} = data
                setAttendees(content)
                setPagination({
                    number: currentPage,
                    size: pageSize,
                    totalElements: totalElements,
                    totalPages: totalPages,
                    items: size

                })
                setLoadingData(false)
            }
        ).catch(error => {
            console.log(error)
            setLoadingData(false)


        });
    }


    // Pagination for large datasets
    const paginations = usePagination(100);

    // Filter data based on selected event
    const filteredAttendees = selectedEvent === 'all'
        ? attendees
        : attendees.filter(a => a.eventId === selectedEvent);

    const filteredVouchers = selectedEvent === 'all'
        ? vouchers
        : vouchers.filter(v => v.eventId === selectedEvent);

    // Calculate statistics with memoization for performance
    const stats = useMemo(() => {
        const totalSoftDrinksClaimed = filteredVouchers.reduce((sum, v) => sum + v.softDrinks.claimed, 0);
        const totalHardDrinksClaimed = filteredVouchers.reduce((sum, v) => sum + v.hardDrinks.claimed, 0);
        const totalDrinksClaimed = totalSoftDrinksClaimed + totalHardDrinksClaimed;
        const maxPossibleDrinks = filteredVouchers.length * 4;

        return {
            totalEvents: events.length,
            totalAttendees: filteredAttendees.length,
            totalVouchers: filteredVouchers.length,
            fullyClaimedVouchers: filteredVouchers.filter(v => v.isFullyClaimed).length,
            totalSoftDrinksClaimed,
            totalHardDrinksClaimed,
            totalDrinksClaimed,
            maxPossibleDrinks,
        };
    }, [events.length, filteredAttendees.length, filteredVouchers]);

    // Event breakdown with memoization
    const eventBreakdown = useMemo(() => {
        return events.map(event => {
            const eventAttendees = attendees.filter(a => a.eventId === event.id);
            const eventVouchers = vouchers.filter(v => v.eventId === event.id);
            const claimedDrinks = eventVouchers.reduce((sum, v) => sum + v.softDrinks.claimed + v.hardDrinks.claimed, 0);

            return {
                event,
                attendeeCount: eventAttendees.length,
                voucherCount: eventVouchers.length,
                claimedDrinks,
                utilizationRate: eventVouchers.length > 0 ? (claimedDrinks / (eventVouchers.length * 4)) * 100 : 0,
            };
        });
    }, [events, attendees, vouchers]);

    // Department breakdown with memoization
    const departmentBreakdown = useMemo(() => {
        return filteredAttendees.reduce((acc, attendee) => {
            const dept = attendee.department || 'Not Specified';
            if (!acc[dept]) {
                acc[dept] = {count: 0, vouchers: 0, drinks: 0};
            }
            acc[dept].count++;

            const attendeeVoucher = vouchers.find(v => v.attendeeId === attendee.id);
            if (attendeeVoucher) {
                acc[dept].vouchers++;
                acc[dept].drinks += attendeeVoucher.softDrinks.claimed + attendeeVoucher.hardDrinks.claimed;
            }

            return acc;
        }, {} as Record<string, { count: number; vouchers: number; drinks: number }>);
    }, [filteredAttendees, vouchers]);

    // Paginated department data
    const departmentEntries = Object.entries(departmentBreakdown);
    const {paginatedData: paginatedDepartments, pagination: deptPaginationInfo} =
        paginations.paginateData(departmentEntries);

    // const getVoucherColor = (vouchers: number) => {
    //     if (vouchers >= 20) return 'text-green-600 bg-green-50';
    //     if (vouchers >= 10) return 'text-yellow-600 bg-yellow-50';
    //     return 'text-red-600 bg-red-50';
    // };

    const exportToCSV = () => {
        const headers = ['PF Number', 'Name', 'Department', 'Check In', 'Vouchers'];
        const csvContent = [
            headers.join(','),
            ...sampleData.map(employee => [
                employee.pfNumber,
                `"${employee.name}"`,
                employee.department,
                employee.checkIn,
                employee.vouchers
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `employees_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportToCsv = (data: any[], filename: string) => {
        if (data.length === 0) {
            showInfo('No data to export');
            return;
        }

        const csvContent = "data:text/csv;charset=utf-8," +
            Object.keys(data[0]).join(",") + "\n" +
            data.map(row => Object.values(row).map(val =>
                typeof val === 'string' && val.includes(',') ? `"${val}"` : val
            ).join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportAttendeeList = () => {
        const data = filteredAttendees.map(attendee => {
            const event = events.find(e => e.id === attendee.eventId);
            const voucher = vouchers.find(v => v.attendeeId === attendee.id);
            return {
                Name: attendee.name,
                Email: attendee.email,
                Phone: attendee.phone || '',
                Department: attendee.department || '',
                Event: event?.name || '',
                VoucherNumber: voucher?.voucherNumber || '',
                SoftDrinksClaimed: voucher?.softDrinks.claimed || 0,
                HardDrinksClaimed: voucher?.hardDrinks.claimed || 0,
                RegisteredAt: new Date(attendee.registeredAt).toLocaleString(),
            };
        });

        exportToCsv(data, `attendees_report_${new Date().toISOString().split('T')[0]}.csv`);
    };
    const getVoucherNumbers = (voucherId: Employee['voucherId']) => {
        return voucherId.map(voucher => voucher.voucherNumber).join(', ');
    };

    const getClaimedAt = (voucherClaims: { id: number, claimedAt: never }[]) => {
        return voucherClaims.map(voucher => new Date(voucher.claimedAt).toLocaleDateString() + ' ' + new Date(voucher.claimedAt).toLocaleTimeString()).join(', ');
    };

    const getVoucherColor = (voucherId: Employee['voucherId']) => {
        const voucherCount = voucherId.length;
        if (voucherCount >= 3) return 'text-green-600 bg-green-50';
        if (voucherCount >= 2) return 'text-yellow-600 bg-yellow-50';
        return 'text-blue-600 bg-blue-50';
    };

    const exportData = async () => {
        setDownloadData(true)
        const event = events.find((ev) => ev.id == selectedEvent)


        await reportsService
            .exportData(selectedEvent, selectedReport)
            .then((response) => {
                if (response instanceof ArrayBuffer) {
                    const fileName = `${event?.name}_${selectedReport}.xlsx`

                    const arrayBuffer = response
                    const blob = new Blob([arrayBuffer], {
                        type: 'application/vnd.ms-excel', //  MIME type
                    })

                    // Create a link element to download the file
                    const url: string = URL.createObjectURL(blob)
                    const link: HTMLAnchorElement = document.createElement('a')
                    link.href = url

                    // Optional: Add a filename for the downloaded file
                    link.download = fileName

                    // Programmatically click the link to trigger download
                    document.body.appendChild(link)
                    link.click()

                    // Cleanup: Remove link element
                    document.body.removeChild(link)
                    URL.revokeObjectURL(url)
                } else {
                    const jsonString = new TextDecoder().decode(new Uint8Array(response.data));
                    const {message} = JSON.parse(jsonString);
                    showError(message || 'Unable download file')

                }

                setDownloadData(false)
            })
            .catch((error) => {
                setDownloadData(false)

                showError(error || 'Unable download file')
            })

    }


    return (
        <div className="space-y-6">
            <div>
                {/*<h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>*/}
                <p className="text-gray-600 mt-1">View detailed reports and export data efficiently</p>
            </div>

            {hasPermission(PERMISSIONS.AR) && (<>

                {/* Report Configuration */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                            <select
                                value={selectedReport}
                                onChange={(e) => setSelectedReport(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
                            >
                                <option value="">Select Report Type</option>
                                <option value="attendees">Attendee Report</option>
                                <option value="vouchers">Voucher Usage Report</option>

                            </select>
                        </div>
                        {events.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Event</label>
                                <select
                                    value={selectedEvent}
                                    onChange={(e) => setSelectedEvent(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coop-500 focus:border-coop-500"
                                >
                                    <option value="">Select Event</option>
                                    {events.map((event) => (
                                        <option key={event.id} value={event.id}>
                                            {event.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>


                {/* Department Analysis with Pagination */}
                {selectedReport === 'attendees' && (
                    <div className="bg-white rounded-xl shadow-sm  ">
                        <div className="bg-white rounded-xl shadow-lg">
                            {/* Header */}
                            {attendees.length > 0 && (
                                <>
                                    <div className="px-6 py-4">
                                        <div className="flex justify-end">
                                            <OverlayLoader
                                                action={"Exporting " + selectedReport + " report for " + selectedEvent}
                                                loading={downloadData}/>
                                            <button
                                                onClick={() => exportData()}
                                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 font-medium text-sm whitespace-nowrap"
                                            >
                                                <Download className="w-4 h-4"/>
                                                Export
                                            </button>
                                        </div>
                                    </div>

                                    {/* Pagination - Top */}

                                    <div className="px-6 py-4 border-b  bg-gray-50">
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                            <div className="text-sm text-gray-600">
                                                Showing <span
                                                className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> to{' '}
                                                <span
                                                    className="font-medium">{(currentPage * pageSize) > pagination.totalElements ? pagination.totalElements : (currentPage * pageSize)}</span> of{' '}
                                                <span className="font-medium">{pagination.totalElements}</span> results
                                            </div>

                                            <div className="flex items-center gap-2">

                                                <EPagination currentPage={currentPage} setPageSize={setPageSize}
                                                             pageCount={pagination.totalPages}
                                                             handlePageChange={function (page: number): void {

                                                                 setCurrentPage(page)

                                                             }} pagesize={pageSize}/>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Table */}
                                    <div className={"divide-y divide-gray-200 relative  border rounded-lg bg-gray-5"}>
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    PF Number
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Name
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Department
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Check In
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Vouchers
                                                </th>
                                            </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                            {attendees.map((employee, index) => (
                                                <tr
                                                    key={employee.id}
                                                    className="hover:bg-gray-50 transition-colors duration-150 ease-in-out"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {employee.pfNumber}
                    </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {employee.name}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {employee.department}
                    </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {`${new Date(employee.registeredAt).toLocaleDateString()} ${new Date(employee.registeredAt).toLocaleTimeString()}`}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                    <span
                        className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getVoucherColor(employee.voucherId)}`}>
                      {getVoucherNumbers(employee.voucherId)}
                    </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>)}
                        </div>
                    </div>
                )}

                {/* Department Analysis with Pagination */}
                {selectedReport === 'vouchers' && (
                    <div className="w-full max-w-7xl mx-auto p-6">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                            {vouchers.length > 0 && (<>
                                    {/* Header */}
                                    <div className="px-6 py-4 border-b border-gray-200">
                                        <div className="flex justify-end">
                                            <OverlayLoader
                                                action={"Exporting " + selectedReport + " report for " + selectedEvent}
                                                loading={downloadData}/>
                                            <button
                                                onClick={() => exportData()}
                                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 font-medium text-sm whitespace-nowrap"
                                            >
                                                <Download className="w-4 h-4"/>
                                                Export
                                            </button>
                                        </div>
                                    </div>

                                    {/* Pagination - Top */}
                                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                            <div className="text-sm text-gray-600">
                                                Showing <span
                                                className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> to{' '}
                                                <span
                                                    className="font-medium">{(currentPage * pageSize) > pagination.totalElements ? pagination.totalElements : (currentPage * pageSize)}</span> of{' '}
                                                <span className="font-medium">{pagination.totalElements}</span> results
                                            </div>

                                            <div className="flex items-center gap-2">

                                                <EPagination currentPage={currentPage} setPageSize={setPageSize}
                                                             pageCount={pagination.totalPages}
                                                             handlePageChange={function (page: number): void {

                                                                 setCurrentPage(page)

                                                             }} pagesize={pageSize}/>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Table */}
                                    <div className={"divide-y divide-gray-200 relative  border rounded-lg bg-gray-5"}>
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Voucher
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Category
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Claimed
                                                </th>

                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Value
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    ClaimedAt
                                                </th>
                                            </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                            {vouchers.map((vouch, index) => (
                                                <tr
                                                    key={vouch.id}
                                                    className="hover:bg-gray-50 transition-colors duration-150 ease-in-out"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {vouch.voucherNumber}
                    </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {vouch.voucherCategory.name}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {`${vouch.claimedNumber} / ${vouch.voucherCategory.numberOfItems}`}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {vouch.voucherCategory.value?.toLocaleString()}
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {vouch?.voucherClaims.length > 0 ? getClaimedAt(vouch?.voucherClaims) : ''}
                                                    </td>

                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </>)}

        </div>
    );
};

export default Reports;