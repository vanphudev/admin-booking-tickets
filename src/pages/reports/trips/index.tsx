import { DownloadOutlined, FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import {
   App,
   Button,
   Card,
   Avatar,
   Tooltip,
   Table,
   Space,
   Typography,
   Empty,
   Spin,
   Select,
   DatePicker,
   Radio,
} from 'antd';
import { TableOutlined, BarChartOutlined } from '@ant-design/icons';
import { createStyles } from 'antd-style';
import routeAPI from '@/redux/api/services/routeAPI';
import { useCallback, useEffect, useState } from 'react';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import NodataImage from '@/assets/images/search-not-found.png';
import reportAPI from '@/redux/api/services/reportAPI';
import ExcelJS from 'exceljs';
import FileSaver from 'file-saver';
import { notification } from 'antd';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/stores/store';

const { Text } = Typography;
const useStyle = createStyles(({ css }) => ({
   customTable: css`
      .ant-table {
         .ant-table-container {
            .ant-table-body,
            .ant-table-content {
               scrollbar-width: thin;
               scrollbar-color: #939393 transparent;
               scrollbar-gutter: stable;
            }
         }
      }
   `,
}));

const { RangePicker } = DatePicker;

export default function tripsReportPage() {
   const { styles } = useStyle();
   const userInfo = useSelector((state: RootState) => state.user.userInfo);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);

   const [viewType, setViewType] = useState('table');
   const [selectedRoute, setSelectedRoute] = useState<string>();
   const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>();
   const [tripReport, setTripReport] = useState<any[]>([]);

   const getTripReport = useCallback(async (params: any) => {
      try {
         setLoading(true);
         const res = await reportAPI.getReportByTrip(params);
         if (res) {
            setTripReport(res);
         }
      } catch (error) {
         notification.error({
            message: 'Lỗi',
            description: 'Đã có lỗi xảy ra khi tải dữ liệu báo cáo',
         });
      } finally {
         setLoading(false);
      }
   }, []);

   const [routes, setRoutes] = useState<any[]>([]);

   useEffect(() => {
      const getRoute = async () => {
         const res = await routeAPI.getRoutes();
         setRoutes(res);
      };
      getRoute();
   }, []);

   const columns: ColumnsType<any> = [
      Table.EXPAND_COLUMN,
      {
         title: 'Tên tuyến xe',
         dataIndex: 'route_name',
         fixed: 'left',
         sorter: (a, b) => a.route_name.localeCompare(b.route_name),
         ellipsis: {
            showTitle: false,
         },
         render: (name) => (
            <Tooltip placement="topLeft" title={name}>
               {name}
            </Tooltip>
         ),
      },
      {
         title: 'Thời gian khởi hành',
         dataIndex: 'start_time',
         align: 'center',
         render: (start_time) => {
            const formattedTime = dayjs(start_time).format('DD/MM/YYYY HH:mm:ss');
            return <Tooltip title={`Thời gian bắt đầu chuyến đi: ${formattedTime}`}>{formattedTime}</Tooltip>;
         },
      },
      {
         title: 'Thời gian đến',
         dataIndex: 'end_time',
         align: 'center',
         render: (end_time) => {
            const formattedTime = dayjs(end_time).format('DD/MM/YYYY HH:mm:ss');
            return <Tooltip title={`Thời gian kết thúc chuyến đi: ${formattedTime}`}>{formattedTime}</Tooltip>;
         },
      },
      {
         title: 'Loại xe',
         dataIndex: 'vehicle_type',
         align: 'center',
         render: (vehicle_type) => vehicle_type,
      },
      {
         title: 'Số lượng ghế trống',
         dataIndex: 'total_empty_seats',
         align: 'center',
         render: (total_empty_seats) => total_empty_seats,
         fixed: 'left',
      },
      {
         title: 'Số lượng ghế đã đặt',
         dataIndex: 'total_booked_seats',
         align: 'center',
         render: (total_booked_seats) => total_booked_seats,
      },
      {
         title: 'Số lượng vé hoàn',
         dataIndex: 'total_refunded_tickets',
         align: 'center',
         render: (total_refunded_tickets) => total_refunded_tickets,
      },
      {
         title: 'Tổng hoàn vé',
         dataIndex: 'total_refunded_amount',
         align: 'center',
         render: (total_refunded_amount) => total_refunded_amount,
      },
      {
         title: 'Tổng giảm giá',
         dataIndex: 'total_discount_amount',
         align: 'center',
         render: (total_discount_amount) => total_discount_amount,
      },
      {
         title: 'Doanh số dự kiến',
         dataIndex: 'total_trips',
         align: 'center',
         render: (total_trips) =>
            new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total_trips),
      },
      {
         title: 'Doanh số thực tế',
         dataIndex: 'total_actual_trips',
         align: 'center',
         render: (total_actual_trips) =>
            new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total_actual_trips),
      },
      {
         title: 'Doanh thu',
         dataIndex: 'total_revenue',
         align: 'center',
         render: (total_revenue) =>
            new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total_revenue),
      },
   ];

   const content = (
      <Table
         className={styles.customTable}
         rowKey={(_record, index) => index || ''}
         style={{ width: '100%', flex: 1 }}
         size="small"
         scroll={{ y: 'calc(100vh - 300px)' }}
         pagination={{
            size: 'default',
            total: tripReport?.length || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} items`,
         }}
         columns={columns as ColumnsType<any>}
         dataSource={error ? [] : tripReport || []}
         loading={loading}
      />
   );

   const handleExportExcel = async () => {
      try {
         if (!selectedRoute || !dateRange) {
            notification.warning({
               message: 'Thông báo',
               description: 'Vui lòng chọn đầy đủ tuyến đường và khoảng thời gian!',
            });
            return;
         }

         // Hiển thị loading
         setLoading(true);

         // 1. Tải template Excel
         const response = await fetch(
            'https://res.cloudinary.com/dkhkjaual/raw/upload/v1734454505/report_trips_template._j0nkup.xlsx',
         );
         const templateBuffer = await response.arrayBuffer();

         // 2. Tạo workbook từ template
         const workbook = new ExcelJS.Workbook();
         await workbook.xlsx.load(templateBuffer);

         // 3. Lấy worksheet cần điền dữ liệu
         const worksheet = workbook.getWorksheet(1); // hoặc theo tên: workbook.getWorksheet('Sheet1');

         // 4. Điền dữ liệu vào template
         let rowIndex = 20; // Giả sử dữ liệu bắt đầu từ hàng 15
         tripReport.forEach((trip) => {
            const row = worksheet?.getRow(rowIndex);

            if (worksheet) {
               worksheet.getRow(15).getCell('D').value = trip.route_name || '';
               worksheet.getRow(16).getCell('D').value = dateRange
                  ? dateRange[0].format('DD/MM/YYYY')
                  : dayjs().utc().format('DD/MM/YYYY');
               worksheet.getRow(17).getCell('D').value = dateRange
                  ? dateRange[1].format('DD/MM/YYYY')
                  : dayjs().utc().format('DD/MM/YYYY');

               worksheet.getRow(10).getCell('H').value =
                  dayjs().format('DD/MM/YYYY HH:mm:ss') +
                  ' - ' +
                  dayjs()
                     .format('dddd')
                     .replace('Monday', 'Thứ hai')
                     .replace('Tuesday', 'Thứ ba')
                     .replace('Wednesday', 'Thứ tư')
                     .replace('Thursday', 'Thứ năm')
                     .replace('Friday', 'Thứ sáu')
                     .replace('Saturday', 'Thứ bảy')
                     .replace('Sunday', 'Chủ nhật');
               worksheet.getRow(12).getCell('I').value =
                  dayjs().format('DD/MM/YYYY HH:mm:ss') +
                  ' - ' +
                  dayjs()
                     .format('dddd')
                     .replace('Monday', 'Thứ hai')
                     .replace('Tuesday', 'Thứ ba')
                     .replace('Wednesday', 'Thứ tư')
                     .replace('Thursday', 'Thứ năm')
                     .replace('Friday', 'Thứ sáu')
                     .replace('Saturday', 'Thứ bảy')
                     .replace('Sunday', 'Chủ nhật');
               worksheet.getRow(13).getCell('I').value =
                  String(userInfo?.fullName ?? '') + ' - ' + String(userInfo?.username ?? '');
               worksheet.getRow(14).getCell('I').value = 'Website - Chrome';
            }
            if (row && worksheet) {
               row.height = 45;
               row.font = { size: 19, name: 'Times New Roman' };
               row.getCell('A').value = trip.route_name;
               row.getCell('B').value =
                  dayjs(trip.start_time).format('DD/MM/YYYY HH:mm:ss') +
                  ' - ' +
                  dayjs(trip.start_time)
                     .format('dddd')
                     .replace('Monday', 'Thứ hai')
                     .replace('Tuesday', 'Thứ ba')
                     .replace('Wednesday', 'Thứ tư')
                     .replace('Thursday', 'Thứ năm')
                     .replace('Friday', 'Thứ sáu')
                     .replace('Saturday', 'Thứ bảy')
                     .replace('Sunday', 'Chủ nhật');
               row.getCell('C').value =
                  dayjs(trip.end_time).format('DD/MM/YYYY HH:mm:ss') +
                  ' - ' +
                  dayjs(trip.end_time)
                     .format('dddd')
                     .replace('Monday', 'Thứ hai')
                     .replace('Tuesday', 'Thứ ba')
                     .replace('Wednesday', 'Thứ tư')
                     .replace('Thursday', 'Thứ năm')
                     .replace('Friday', 'Thứ sáu')
                     .replace('Saturday', 'Thứ bảy')
                     .replace('Sunday', 'Chủ nhật');
               row.getCell('D').value = trip.vehicle_type;
               row.getCell('E').value = trip.total_empty_seats;
               row.getCell('F').value = trip.total_booked_seats;
               row.getCell('G').value = trip.total_refunded_tickets;
               row.getCell('H').value = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                  trip.total_refunded_amount,
               );
               row.getCell('I').value = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                  trip.total_discount_amount,
               );
               row.getCell('J').value = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                  trip.total_trips,
               );
               row.getCell('K').value = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                  trip.total_actual_trips,
               );
               row.getCell('L').value = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                  trip.total_revenue,
               );
               row?.eachCell((cell) => {
                  cell.alignment = { ...cell.alignment, wrapText: true };
                  cell.alignment = { vertical: 'middle' };
                  cell.border = {
                     top: { style: 'thin' },
                     left: { style: 'thin' },
                     bottom: { style: 'thin' },
                     right: { style: 'thin' },
                  };
               });
            }

            rowIndex++;
         });

         let totalRefundedAmount = tripReport.reduce((acc, trip) => acc + parseFloat(trip.total_refunded_amount), 0);
         let totalDiscountAmount = tripReport.reduce((acc, trip) => acc + parseFloat(trip.total_discount_amount), 0);
         let totalTrips = tripReport.reduce((acc, trip) => acc + parseFloat(trip.total_trips), 0);
         let totalActualTrips = tripReport.reduce((acc, trip) => acc + parseFloat(trip.total_actual_trips), 0);
         let totalRevenue = tripReport.reduce((acc, trip) => acc + parseFloat(trip.total_revenue), 0);

         if (worksheet) {
            const totalRow = worksheet.getRow(rowIndex + 1);
            totalRow.height = 45;
            totalRow.font = { size: 22, name: 'Times New Roman' };
            totalRow.getCell('H').value = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
               totalRefundedAmount || 0,
            );
            totalRow.getCell('I').value = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
               totalDiscountAmount || 0,
            );
            totalRow.getCell('J').value = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
               totalTrips || 0,
            );
            totalRow.getCell('K').value = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
               totalActualTrips || 0,
            );
            totalRow.getCell('L').value = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
               totalRevenue || 0,
            );

            totalRow.eachCell((cell) => {
               cell.border = {
                  top: { style: 'thin' },
                  left: { style: 'thin' },
                  bottom: { style: 'thin' },
                  right: { style: 'thin' },
               };
            });
         }

         // 6. Xuất file
         const buffer = await workbook.xlsx.writeBuffer();
         const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
         const blob = new Blob([buffer], { type: fileType });
         FileSaver.saveAs(blob, `Trip_Report_${dayjs().format('DDMMYYYY_HHmmss')}.xlsx`);

         // Thông báo thành công
         notification.success({
            message: 'Xuất Excel thành công!',
            description: 'File đã được tải xuống.',
         });
      } catch (error) {
         // Xử lý lỗi
         notification.error({
            message: 'Xuất Excel thất bại!',
            description: error.message,
         });
      } finally {
         // Tắt loading
         setLoading(false);
      }
   };

   return (
      <Card
         style={{ maxHeight: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}
         styles={{ body: { padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' } }}
         title="Thống kê doanh thu chuyến đi"
         extra={
            <Space>
               <Button
                  type="primary"
                  size="large"
                  icon={<FilterOutlined />}
                  onClick={() => {
                     if (!selectedRoute || !dateRange) {
                        notification.warning({
                           message: 'Thông báo',
                           description: 'Vui lòng chọn đầy đủ tuyến đường và khoảng thời gian!',
                        });
                        return;
                     }
                     if (selectedRoute && dateRange) {
                        const params = {
                           routeId: selectedRoute,
                           startDate: dateRange
                              ? dateRange[0].format('YYYY-MM-DD')
                              : dayjs().utc().format('YYYY-MM-DD'),
                           endDate: dateRange ? dateRange[1].format('YYYY-MM-DD') : dayjs().utc().format('YYYY-MM-DD'),
                        };
                        getTripReport(params);
                     }
                  }}
               >
                  Lọc Báo Cáo
               </Button>
               <Button type="primary" size="large" icon={<DownloadOutlined />} onClick={handleExportExcel}>
                  Xuất Báo Cáo
               </Button>
            </Space>
         }
      >
         <Space style={{ marginBottom: 16 }} size="middle" className="w-full">
            <div>
               <div style={{ marginBottom: 8 }}>
                  <label>Tuyến đường</label>
               </div>
               <Select
                  showSearch
                  allowClear
                  showArrow
                  size="large"
                  style={{ width: 400 }}
                  placeholder="Chọn tuyến đường"
                  onChange={(value) => setSelectedRoute(value)}
                  options={routes.map((route) => ({
                     value: route.route_id,
                     label: route.route_name,
                  }))}
               />
            </div>
            <div>
               <div style={{ marginBottom: 8 }}>
                  <label>Khoảng thời gian</label>
               </div>
               <RangePicker size="large" onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs])} format="DD/MM/YYYY" />
            </div>
         </Space>
         {content}
      </Card>
   );
}
