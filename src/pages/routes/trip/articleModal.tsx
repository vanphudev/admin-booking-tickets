import { useEffect, useState } from 'react';
import {
   App,
   Form,
   Modal,
   Input,
   Radio,
   Upload,
   Spin,
   Row,
   Col,
   Select,
   DatePicker,
   InputNumber,
   TimePicker,
} from 'antd';
import { Iconify } from '@/components/icon';
import { Office, Way } from '../route/entity';
import { Route } from '../route/entity';
import { VehicleType, MapVehicleLayout } from '@/pages/management/vehicle/entity';

import 'react-quill/dist/quill.snow.css';
import { Trip } from './entity';
import tripAPI from '@/redux/api/services/tripAPI';
import routeAPI from '@/redux/api/services/routeAPI';
import vehicleAPI from '@/redux/api/services/vehicleAPI';
import { Vehicle } from '@/pages/management/vehicle/entity';
import moment from 'moment';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Ho_Chi_Minh');

const styles = `
   .bus-modal-avatar-uploader .ant-upload {
      width: 300px !important;
      height: 300px !important;
      background-color: #fafafa;
      border: 1px dashed #d9d9d9;
      border-radius: 8px;
      cursor: pointer;
      transition: border-color 0.3s;
   }

   .bus-modal-avatar-uploader .ant-upload:hover {
      border-color: #FF3030;
   }

   .ql-container {
      min-height: 200px;
   }

   .ql-editor {
      min-height: 200px;
   }
`;
if (typeof document !== 'undefined') {
   const styleSheet = document.createElement('style');
   styleSheet.innerText = styles;
   document.head.appendChild(styleSheet);
}

function transformApiResponseToRoute(apiResponse: any): Route {
   return {
      route_id: apiResponse.route_id,
      route_name: apiResponse.route_name,
      route_duration: apiResponse.route_duration,
      route_distance: apiResponse.route_distance,
      route_price: apiResponse.route_price,
      route_url_gps: apiResponse.route_url_gps,
      origin_office_id: apiResponse.origin_office_id,
      destination_office_id: apiResponse.destination_office_id,
      is_locked: apiResponse.is_locked,
      last_lock_at: apiResponse.last_lock_at || '',
      is_default: apiResponse.is_default,
      way: {
         way_id: apiResponse?.way?.way_id,
         way_name: apiResponse?.way?.way_name,
         way_description: apiResponse?.way?.way_description,
         origin_office: apiResponse?.way?.origin_office
            ? {
                 office_id: apiResponse?.way?.origin_office?.office_id,
                 office_name: apiResponse?.way?.origin_office?.office_name,
              }
            : ({} as Office),
         destination_office: apiResponse?.way?.destination_office
            ? {
                 office_id: apiResponse?.way?.destination_office?.office_id,
                 office_name: apiResponse?.way?.destination_office?.office_name,
              }
            : ({} as Office),
      } as Way,
   };
}

function transformApiResponseToVehicle(apiResponse: any): Vehicle {
   const VEHICLE_TYPE: VehicleType = {
      id: apiResponse.vehicleType?.id,
      name: apiResponse.vehicleType?.name,
      description: apiResponse.vehicleType?.description,
   };
   const VEHICLE_LAYOUT: MapVehicleLayout = {
      id: apiResponse.mapVehicleLayout?.id,
      name: apiResponse.mapVehicleLayout?.name,
      vehicle_type: VEHICLE_TYPE,
   };

   return {
      id: apiResponse.id,
      code: apiResponse.code,
      license_plate: apiResponse.license_plate,
      model: apiResponse.model,
      brand: apiResponse.brand,
      capacity: apiResponse.capacity,
      manufacture_year: apiResponse.manufacture_year,
      color: apiResponse.color,
      description: apiResponse.description,
      isLocked: apiResponse.isLocked === 1 ? 1 : 0,
      lastLockAt: apiResponse.lastLockAt || '',
      mapVehicleLayout: VEHICLE_LAYOUT,
      images: apiResponse.images || '',
   };
}

export type TripModalProps = {
   formValue: Trip;
   title: string;
   show: boolean;
   onOk: VoidFunction;
   onCancel: VoidFunction;
   isCreate: boolean;
};

export function TripModal({ formValue, title, show, onOk, onCancel, isCreate }: TripModalProps) {
   const [form] = Form.useForm();
   const { notification } = App.useApp();
   const [loading, setLoading] = useState(false);
   const [routes, setRoutes] = useState<Route[]>([]);
   const [vehicles, setVehicles] = useState<Vehicle[]>([]);

   const initializeForm = () => {
      if (show && formValue) {
         const routeExists = routes.some((route) => route.route_id === formValue.route?.route_id);
         const vehicleExists = vehicles.some((vehicle) => vehicle.id === formValue.vehicle?.vehicle_id);
         const initialValues = {
            ...formValue,
            trip_date: formValue.trip_date ? dayjs.utc(formValue.trip_date).tz('Asia/Ho_Chi_Minh') : null,
            trip_departure_time: formValue.trip_departure_time
               ? dayjs.utc(formValue.trip_departure_time).tz('Asia/Ho_Chi_Minh')
               : null,
            trip_arrival_time: formValue.trip_arrival_time
               ? dayjs.utc(formValue.trip_arrival_time).tz('Asia/Ho_Chi_Minh')
               : null,
            route_id: routeExists ? formValue.route?.route_id : undefined,
            vehicle_id: vehicleExists ? formValue.vehicle?.vehicle_id : undefined,
         };
         form.setFieldsValue(initialValues);
      }
   };

   useEffect(() => {
      if (!show) {
         form.resetFields();
      }
   }, [show, form]);

   useEffect(() => {
      if (show) {
         initializeForm();
      }
   }, [show, formValue]);

   const fetchRoutes = async () => {
      const res = await routeAPI.getRoutes();
      if (res) {
         setRoutes(res.map(transformApiResponseToRoute));
      }
   };

   useEffect(() => {
      fetchRoutes();
   }, []);

   const fetchVehicles = async () => {
      const res = await vehicleAPI.getVehicles();
      if (res) {
         setVehicles(res.map(transformApiResponseToVehicle));
      }
   };

   useEffect(() => {
      fetchVehicles();
   }, []);

   const handleOk = () => {
      form.validateFields().then((formData) => {
         const tripDate = dayjs(formData.trip_date).format('YYYY-MM-DD');
         const departureTime = dayjs(formData.trip_departure_time).format('HH:mm');
         const arrivalTime = dayjs(formData.trip_arrival_time).format('HH:mm');
         const tripDepartureTime = dayjs(`${tripDate} ${departureTime}`).format('YYYY-MM-DD HH:mm');
         const tripArrivalTime = dayjs(`${tripDate} ${arrivalTime}`).format('YYYY-MM-DD HH:mm');

         console.log(tripDepartureTime, tripArrivalTime);

         if (dayjs(tripDepartureTime).isAfter(tripArrivalTime) || dayjs(tripDepartureTime).isSame(tripArrivalTime)) {
            notification.warning({
               message: 'Giờ khởi hành phải nhỏ hơn giờ đến!',
               duration: 3,
            });
            return;
         }

         const tripDiscount = Number(formData.trip_discount);
         const tripPrice = Number(formData.trip_price);

         if (isNaN(tripDiscount) || tripDiscount < 0 || tripDiscount > 100) {
            notification.warning({
               message: 'Giảm giá phải từ 0 đến 100!',
               duration: 3,
            });
            return;
         }

         if (isNaN(tripPrice) || tripPrice <= 0) {
            notification.warning({
               message: 'Giá vé phải lớn hơn 0!',
               duration: 3,
            });
            return;
         }

         const dataToSend = {
            ...formData,
            trip_date: tripDate,
            trip_departure_time: tripDepartureTime,
            trip_arrival_time: tripArrivalTime,
            trip_discount: tripDiscount,
            trip_price: tripPrice,
         };

         const submitData = {
            trip_id: formValue.trip_id,
            ...dataToSend,
         };

         setLoading(true);
         const apiCall = isCreate ? tripAPI.createTrip(submitData) : tripAPI.updateTrip(submitData);
         apiCall
            .then((res) => {
               if (res && (res.status === 201 || res.status === 200)) {
                  notification.success({
                     message: `${isCreate ? 'Tạo' : 'Cập nhật'} chuyến xe thành công!`,
                     duration: 3,
                  });
                  onOk();
               } else {
                  notification.warning({
                     message: `${isCreate ? 'Tạo' : 'Cập nhật'} chuyến xe thất bại!`,
                     duration: 3,
                  });
               }
            })
            .catch((error) => {
               notification.error({
                  message: `Lỗi: ${error.message}`,
                  duration: 3,
               });
            })
            .finally(() => setLoading(false));
      });
   };

   return (
      <Modal
         title={<p style={{ fontSize: '28px', fontWeight: 'bold' }}>{title}</p>}
         open={show}
         onOk={handleOk}
         onCancel={onCancel}
         width={1000}
         centered
         destroyOnClose
      >
         <Spin spinning={loading} tip={isCreate ? 'Đang tạo...' : 'Đang cập nhật...'}>
            <Form
               form={form}
               layout="vertical"
               style={{
                  maxHeight: '70vh',
               }}
            >
               {/* Row 1: Route và Vehicle Select */}
               <Row gutter={16}>
                  <Col span={12}>
                     <Form.Item
                        name="route_id"
                        label="Tuyến đường"
                        rules={[{ required: true, message: 'Vui lòng chọn tuyến đường!' }]}
                     >
                        <Select
                           size="large"
                           placeholder="Chọn tuyến đường"
                           showSearch
                           optionFilterProp="children"
                           filterOption={(input, option) =>
                              typeof option?.label === 'string'
                                 ? option.label.toLowerCase().includes(input.toLowerCase())
                                 : false
                           }
                        >
                           {routes.map((route) => (
                              <Select.Option key={route.route_id} label={route.route_name} value={route.route_id}>
                                 {route.route_name}
                              </Select.Option>
                           ))}
                        </Select>
                     </Form.Item>
                  </Col>
                  <Col span={12}>
                     <Form.Item
                        name="vehicle_id"
                        label="Phương tiện"
                        rules={[{ required: true, message: 'Vui lòng chọn phương tiện!' }]}
                     >
                        <Select
                           size="large"
                           placeholder="Chọn phương tiện"
                           showSearch
                           optionFilterProp="children"
                           filterOption={(input, option) =>
                              typeof option?.label === 'string'
                                 ? option.label.toLowerCase().includes(input.toLowerCase())
                                 : false
                           }
                        >
                           {vehicles.map((vehicle) => (
                              <Select.Option key={vehicle.id} value={vehicle.id}>
                                 {vehicle.license_plate} - {vehicle.code} (
                                 {vehicle?.mapVehicleLayout?.vehicle_type?.name})
                              </Select.Option>
                           ))}
                        </Select>
                     </Form.Item>
                  </Col>
               </Row>

               {/* Row 2: Thời gian */}
               <Row gutter={16}>
                  <Col span={12}>
                     <Form.Item
                        name="trip_date"
                        label="Ngày khởi hành"
                        rules={[{ required: true, message: 'Vui lòng chọn ngày khởi hành!' }]}
                     >
                        <DatePicker
                           size="large"
                           format="YYYY-MM-DD"
                           placeholder="Chọn ngày khởi hành"
                           style={{ width: '100%' }}
                           disabledDate={(current) => current && current < dayjs().startOf('day')}
                        />
                     </Form.Item>
                  </Col>
                  <Col span={6}>
                     <Form.Item
                        name="trip_departure_time"
                        label="Giờ khởi hành"
                        rules={[{ required: true, message: 'Vui lòng chọn giờ khởi hành!' }]}
                     >
                        <TimePicker
                           size="large"
                           format="HH:mm"
                           placeholder="Chọn giờ khởi hành"
                           style={{ width: '100%' }}
                        />
                     </Form.Item>
                  </Col>
                  <Col span={6}>
                     <Form.Item
                        name="trip_arrival_time"
                        label="Giờ đến"
                        rules={[{ required: true, message: 'Vui lòng chọn giờ đến!' }]}
                     >
                        <TimePicker size="large" format="HH:mm" placeholder="Chọn giờ đến" style={{ width: '100%' }} />
                     </Form.Item>
                  </Col>
               </Row>

               {/* Row 3: Giá vé */}
               <Row gutter={16}>
                  <Col span={12}>
                     <Form.Item
                        name="trip_price"
                        label="Giá vé"
                        rules={[
                           { required: true, message: 'Vui lòng nhập giá vé!' },
                           { type: 'number', message: 'Vui lòng chỉ nhập số!' },
                        ]}
                     >
                        <InputNumber
                           size="large"
                           style={{ width: '100%' }}
                           min={0}
                           step={1000}
                           placeholder="Nhập giá vé"
                           onChange={() => form.validateFields(['trip_discount'])}
                           keyboard={false}
                        />
                     </Form.Item>
                  </Col>
                  <Col span={12}>
                     <Form.Item
                        name="trip_discount"
                        label="Giảm giá (%)"
                        dependencies={['trip_price']}
                        rules={[
                           {
                              type: 'number',
                              min: 0,
                              max: 100,
                              required: true,
                              message: 'Vui lòng  nhập số từ 0 đến 100!',
                           },
                        ]}
                     >
                        <InputNumber
                           size="large"
                           style={{ width: '100%' }}
                           placeholder="Nhập % giảm giá"
                           keyboard={false}
                        />
                     </Form.Item>
                  </Col>
               </Row>

               {/* Row 4: Các tùy chọn */}
               <Row gutter={16}>
                  <Col span={8}>
                     <Form.Item name="trip_shuttle_enable" label="Đưa đón">
                        <Radio.Group size="large" optionType="button" buttonStyle="solid">
                           <Radio value={1}>Có</Radio>
                           <Radio value={0}>Không</Radio>
                        </Radio.Group>
                     </Form.Item>
                  </Col>
                  <Col span={8}>
                     <Form.Item name="allow_online_booking" label="Đặt vé online">
                        <Radio.Group size="large" optionType="button" buttonStyle="solid">
                           <Radio value={1}>Có</Radio>
                           <Radio value={0}>Không</Radio>
                        </Radio.Group>
                     </Form.Item>
                  </Col>
                  <Col span={8}>
                     <Form.Item name="trip_holiday" label="Ngày lễ">
                        <Radio.Group size="large" optionType="button" buttonStyle="solid">
                           <Radio value={1}>Có</Radio>
                           <Radio value={0}>Không</Radio>
                        </Radio.Group>
                     </Form.Item>
                  </Col>
               </Row>
            </Form>
         </Spin>
      </Modal>
   );
}
