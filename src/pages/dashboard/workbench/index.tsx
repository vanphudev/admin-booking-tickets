import { Col, Row, Card, notification } from 'antd';
import { Helmet } from 'react-helmet-async';
import Color from 'color';
import AreaDownload from './area-download';
import CurrentDownload from './current-download';
import TotalCard from './total-card';
import { useCallback, useEffect, useState } from 'react';
import employeeAPI from '@/redux/api/services/employeeAPI';
import customerAPI from '@/redux/api/services/customerAPI';
import paymentMethodAPI from '@/redux/api/services/paymentMethodAPI';
import AnalysisCard from './analysis-card';
import glass_bag from '@/assets/images/glass/ic_glass_bag.png';
import glass_buy from '@/assets/images/glass/ic_glass_buy.png';
import glass_message from '@/assets/images/glass/ic_glass_message.png';
import glass_users from '@/assets/images/glass/ic_glass_users.png';
import ChartMixed from '@/pages/components/chart/view/chart-mixed';
import ChartPie from '@/pages/components/chart/view/chart-pie';
import { useThemeToken } from '@/theme/hooks';
import tripAPI from '@/redux/api/services/tripAPI';
import reportAPI from '@/redux/api/services/reportAPI';
import { setCustomerSlice } from '@/redux/slices/customerSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/stores/store';
import { Customer } from '@/pages/users/customer/entity';

function transformApiResponseToCustomer(apiResponse: any): Customer {
   return {
      customer_id: apiResponse.customer_id,
      customer_full_name: apiResponse.customer_full_name,
      customer_email: apiResponse.customer_email,
      customer_phone: apiResponse.customer_phone,
      customer_birthday: apiResponse.customer_birthday,
      customer_password: apiResponse.customer_password,
      customer_gender: apiResponse.customer_gender,
      customer_avatar: apiResponse.customer_avatar,
      customer_destination_address: apiResponse.customer_destination_address,
      is_disabled: apiResponse.is_disabled === 1 ? 1 : 0,
      bonus_point: apiResponse.bonus_point,
      created_at: apiResponse.created_at,
      updated_at: apiResponse.updated_at,
   };
}

function Workbench() {
   const [loading, setLoading] = useState(false);
   const dispatch = useDispatch();
   const customersSlice = useSelector((state: RootState) => state.customer.customers);
   const [countEmployee, setCountEmployee] = useState(0);
   const [countCustomer, setCountCustomer] = useState(0);
   const [countBooking, setCountBooking] = useState(0);
   const [countTrip, setCountTrip] = useState(0);
   const [bookingStatusStatsByMonth, setBookingStatusStatsByMonth] = useState([]);
   const theme = useThemeToken();
   const [customers, setCustomers] = useState<Customer[]>([]);

   const loadCustomers = useCallback(async () => {
      try {
         setLoading(true);
         const response = await customerAPI.getCustomers();
         if (response) {
            dispatch(setCustomerSlice(response.map(transformApiResponseToCustomer)));
            setCustomers(response.map(transformApiResponseToCustomer));
         } else {
            notification.error({
               message: 'Lỗi tải danh sách khách hàng',
               description: (
                  <div style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                     <p>Không thể tải danh sách khách hàng!</p>
                     <p>ERROR: {response.message}</p>
                  </div>
               ),
               duration: 5,
               style: {
                  border: '1px solid #ff4d4f',
                  borderRadius: '5px',
                  backgroundColor: '#fff1f0',
               },
            });
         }
      } catch (error: any) {
         notification.error({
            message: 'Lỗi tải danh sách khách hàng',
            description: (
               <div style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                  <p>Không thể tải danh sách khách hàng!</p>
                  <p>ERROR: {error.message}</p>
               </div>
            ),
            duration: 5,
            style: {
               border: '1px solid #ff4d4f',
               borderRadius: '5px',
               backgroundColor: '#fff1f0',
            },
         });
      } finally {
         setLoading(false);
      }
   }, [dispatch, notification]);

   useEffect(() => {
      loadCustomers();
   }, [loadCustomers]);

   useEffect(() => {
      setLoading(true);
      employeeAPI.countEmployee().then((res: any) => {
         setCountEmployee(res?.metadata?.count);
      });
      customerAPI.countCustomer().then((res: any) => {
         setCountCustomer(res?.metadata?.count);
      });
      paymentMethodAPI.countBooking().then((res: any) => {
         setCountBooking(res?.metadata?.count);
      });
      tripAPI.countTrip().then((res: any) => {
         setCountTrip(res?.metadata?.count);
      });
      reportAPI.getBookingStatusStatsByMonth().then((res: any) => {
         setBookingStatusStatsByMonth(res);
      });
   }, []);

   useEffect(() => {
      setLoading(false);
   }, [countEmployee, countCustomer, countBooking, countTrip, bookingStatusStatsByMonth]);

   return (
      <>
         <Helmet>
            <title>Workbench</title>
         </Helmet>
         <div className="p-2">
            <Row gutter={[16, 16]} justify="center">
               <Col lg={8} md={12} span={24}>
                  <AnalysisCard
                     cover={glass_bag}
                     title={countBooking?.toString() || '0'}
                     subtitle="Tổng số đơn đặt vé đã hoàn thành"
                     style={{
                        color: theme.colorPrimaryTextActive,
                        background: `linear-gradient(135deg, ${Color(theme.colorPrimaryActive)
                           .alpha(0.2)
                           .toString()}, ${Color(theme.colorPrimary).alpha(0.2).toString()}) rgb(255, 255, 255)`,
                     }}
                  />
               </Col>
               <Col lg={8} md={12} span={24}>
                  <AnalysisCard
                     cover={glass_users}
                     title={countCustomer?.toString() || '0'}
                     subtitle="Tổng số khách hàng"
                     style={{
                        color: theme.colorInfoTextActive,
                        background: `linear-gradient(135deg, ${Color(theme.colorInfoActive)
                           .alpha(0.2)
                           .toString()}, ${Color(theme.colorInfo).alpha(0.2).toString()}) rgb(255, 255, 255)`,
                     }}
                  />
               </Col>
               <Col lg={8} md={12} span={24}>
                  <AnalysisCard
                     cover={glass_message}
                     title={countTrip?.toString() || '0'}
                     subtitle="Tổng số chuyến xe hiện hành"
                     style={{
                        color: theme.colorErrorTextActive,
                        background: `linear-gradient(135deg, ${Color(theme.colorErrorActive)
                           .alpha(0.2)
                           .toString()}, ${Color(theme.colorError).alpha(0.2).toString()}) rgb(255, 255, 255)`,
                     }}
                  />
               </Col>
            </Row>
            <Row gutter={[16, 16]} className="mt-4" justify="center">
               <Col span={24} md={8}>
                  <TotalCard
                     title="Tổng số nhân viên"
                     increase
                     count={countEmployee?.toString() || '0'}
                     percent={`Tỉ lệ: ${(countEmployee / 1000).toFixed(2)}%`}
                     chartData={[22, 8, 35, 50, 82, 84, 77, 12, 87, 43]}
                  />
               </Col>
               <Col span={24} md={8}>
                  <TotalCard
                     title="Tổng số khách hàng"
                     increase
                     count={countCustomer?.toString() || '0'}
                     percent={`Tỉ lệ: ${(countCustomer / 1000).toFixed(2)}%`}
                     chartData={[45, 52, 38, 24, 33, 26, 21, 20, 6]}
                  />
               </Col>
               <Col span={24} md={8}>
                  <TotalCard
                     title="Tổng số đơn hàng đã hoàn thành"
                     increase
                     count={countBooking?.toString() || '0'}
                     percent={`Tỉ lệ: ${(countBooking / 1000).toFixed(2)}%`}
                     chartData={[35, 41, 62, 42, 13, 18, 29, 37, 36]}
                  />
               </Col>
            </Row>
            <Row gutter={[16, 16]} className="mt-8" justify="center">
               <Col span={24} lg={12} xl={16}>
                  <Card title="Thống kê trạng thái đơn đặt vé">
                     <ChartMixed data={bookingStatusStatsByMonth} />
                  </Card>
               </Col>
               <Col span={24} lg={12} xl={8}>
                  <Card title="Tỉ lệ đơn đặt vé">
                     <ChartPie data={bookingStatusStatsByMonth} />
                  </Card>
               </Col>
            </Row>
            {/* <Row gutter={[16, 16]} className="mt-4" justify="center">
               <Col span={24}>
                  <AreaDownload customers={customers} />
               </Col>
            </Row> */}
         </div>
      </>
   );
}

export default Workbench;
