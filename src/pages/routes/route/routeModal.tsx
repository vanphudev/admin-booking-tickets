import { Route, Way } from './entity';
import { useEffect, useState } from 'react';
import { App, Form, Modal, Input, Radio, Upload, Spin, Row, Col, Select, Card } from 'antd';

import routeAPI from '@/redux/api/services/routeAPI';
import wayAPI from '@/redux/api/services/wayAPI';

import { Way as WayEntity, PickupPoint } from '@/pages/management/way/entity';

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

export type RouteModalProps = {
   formValue: Route;
   title: string;
   show: boolean;
   onOk: VoidFunction;
   onCancel: VoidFunction;
   isCreate: boolean;
};

function transformApiResponseToWay(apiResponse: any): WayEntity {
   return {
      way_id: apiResponse.way_id,
      way_name: apiResponse.way_name,
      way_description: apiResponse.way_description,
      list_pickup_point: apiResponse.way_to_pickupPoint
         ? apiResponse.way_to_pickupPoint.map((item: any) => ({
              way_id: item.pickup_point_way_id,
              office_id: item.pickup_point_office_id,
              office_name: item.pickupPoint_belongto_office?.office_name,
              pickup_point_name: item.pickup_point_name,
              pickup_point_time: item.pickup_point_time,
              pickup_point_kind: item.pickup_point_kind,
              pickup_point_description: item.pickup_point_description,
              point_kind_name: item.point_kind_name,
           }))
         : [],
   };
}

export function RouteModal({ formValue, title, show, onOk, onCancel, isCreate }: RouteModalProps) {
   const [form] = Form.useForm();
   const { notification } = App.useApp();
   const [loading, setLoading] = useState(false);
   const [selectedWay, setSelectedWay] = useState<WayEntity | null>(null);
   const [ways, setWays] = useState<WayEntity[]>([]);
   const [originOffice, setOriginOffice] = useState<any>(null);
   const [destinationOffice, setDestinationOffice] = useState<any>(null);

   useEffect(() => {
      fetchWays();
   }, []);

   useEffect(() => {
      if (show) {
         if (isCreate) {
            form.resetFields();
            setOriginOffice(null);
            setDestinationOffice(null);
            setSelectedWay(null);
         } else {
            // Load dữ liệu khi edit
            form.setFieldsValue({
               way_id: formValue.way.way_id,
               route_name: formValue.route_name,
               route_duration: formValue.route_duration,
               route_distance: formValue.route_distance,
               route_price: formValue.route_price,
               is_default: formValue.is_default,
               is_locked: formValue.is_locked,
            });

            // Tìm way được chọn từ danh sách ways đã có
            const selectedWay = ways.find((way) => way.way_id === formValue.way.way_id);
            if (selectedWay) {
               setSelectedWay(selectedWay);

               // Set thông tin điểm đi/đến từ selectedWay
               const pickupPoints = selectedWay.list_pickup_point || [];

               // Tìm điểm đi (kind = -1)
               const origin = pickupPoints.find((point: PickupPoint) => point.pickup_point_kind === -1);
               if (origin) {
                  setOriginOffice({
                     office_id: origin.office_id,
                     office_name: origin.office_name,
                     pickup_point_name: origin.pickup_point_name,
                     pickup_point_time: origin.pickup_point_time,
                     pickup_point_description: origin.pickup_point_description,
                  });
               }

               // Tìm điểm đến (kind = 1)
               const destination = pickupPoints.find((point) => point.pickup_point_kind === 1);
               if (destination) {
                  setDestinationOffice({
                     office_id: destination.office_id,
                     office_name: destination.office_name,
                     pickup_point_name: destination.pickup_point_name,
                     pickup_point_time: destination.pickup_point_time,
                     pickup_point_description: destination.pickup_point_description,
                  });
               }
            }
         }
      }
   }, [show, isCreate, formValue, ways]);

   useEffect(() => {
      if (show && formValue) {
         console.log(formValue);
         form.setFieldsValue({
            ...formValue,
         });
      }
   }, [show, formValue]);

   const handleCancel = () => {
      if (show) {
         form.resetFields();
         setOriginOffice(null);
         setDestinationOffice(null);
         setSelectedWay(null);
      }
      onCancel();
   };

   const fetchWays = async () => {
      const data = await wayAPI.getWays();
      const transformedData = data.map(transformApiResponseToWay);
      setWays(transformedData);
   };

   const handleOk = () => {
      form.validateFields().then((formData) => {
         console.log('formData', formData);
         const submitData = {
            route_id: formValue.route_id || null,
            route_name: formData.route_name,
            route_duration: formData.route_duration,
            route_distance: formData.route_distance,
            route_url_gps: formData.route_url_gps || null,
            origin_office_id: originOffice?.office_id || null,
            destination_office_id: destinationOffice?.office_id || null,
            route_price: formData.route_price,
            is_default: formData.is_default,
            is_locked: formData.is_locked,
            way_id: formData.way_id,
         };
         setLoading(true);
         const apiCall = isCreate ? routeAPI.createRoute(submitData) : routeAPI.updateRoute(submitData);
         apiCall
            .then((res) => {
               if (res && (res.status === 201 || res.status === 200)) {
                  notification.success({
                     message: `${isCreate ? 'Tạo' : 'Cập nhật'} xe thành công!`,
                     duration: 3,
                  });
                  onOk();
               } else {
                  notification.warning({
                     message: `${isCreate ? 'Tạo' : 'Cập nhật'} xe thất bại!`,
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

   const handleWaySelect = (value: any, option: any) => {
      const selectedWay = option.way;
      setSelectedWay(selectedWay);

      // Lọc pickup points theo kind
      const pickupPoints = selectedWay.list_pickup_point || [];

      // Tìm điểm đi (kind = -1)
      const origin = pickupPoints.find((point: PickupPoint) => point.pickup_point_kind === -1);
      if (origin) {
         setOriginOffice({
            office_name: origin.office_name,
            pickup_point_name: origin.pickup_point_name,
            pickup_point_time: origin.pickup_point_time,
            pickup_point_description: origin.pickup_point_description,
         });
      }

      // Tìm điểm đến (kind = 1)
      const destination = pickupPoints.find((point: PickupPoint) => point.pickup_point_kind === 1);
      if (destination) {
         setDestinationOffice({
            office_name: destination.office_name,
            pickup_point_name: destination.pickup_point_name,
            pickup_point_time: destination.pickup_point_time,
            pickup_point_description: destination.pickup_point_description,
         });
      }
   };

   const renderOfficeInfo = (title: string, office: any) => (
      <Card title={title} bordered={false} style={{ marginBottom: 16 }}>
         <p>
            <strong>Tên văn phòng:</strong> {office?.office_name || ''}
         </p>
         <p>
            <strong>Điểm đón:</strong> {office?.pickup_point_name || 'Chưa chọn'}
         </p>
         <p>
            <strong>Mô tả:</strong> {office?.pickup_point_description || 'Không có'}
         </p>
      </Card>
   );

   const validateMessages = {
      required: '${label} là bắt buộc!',
      types: {
         number: '${label} phải là số!',
      },
      number: {
         min: '${label} không được nhỏ hơn ${min}!',
         max: '${label} không được lớn hơn ${max}!',
      },
   };

   const content = (
      <Form
         form={form}
         layout="vertical"
         initialValues={formValue}
         validateMessages={validateMessages}
         style={{
            maxHeight: '70vh',
         }}
      >
         <Row gutter={[16, 16]}>
            <Col span={24}>
               <Form.Item
                  name="way_id"
                  label="Chọn Way"
                  rules={[
                     {
                        required: true,
                        message: 'Vui lòng chọn way!',
                     },
                  ]}
               >
                  <Select
                     size="large"
                     placeholder="Chọn way"
                     onChange={handleWaySelect}
                     showSearch
                     optionFilterProp="children"
                  >
                     {ways?.map((way) => (
                        <Select.Option key={way.way_id} value={way.way_id} way={way}>
                           {way.way_name}
                        </Select.Option>
                     ))}
                  </Select>
               </Form.Item>
            </Col>
         </Row>

         <Row gutter={16}>
            <Col span={12}>{renderOfficeInfo('Văn phòng đi', originOffice)}</Col>
            <Col span={12}>{renderOfficeInfo('Văn phòng đến', destinationOffice)}</Col>
         </Row>

         <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col span={12}>
               <Form.Item
                  name="route_name"
                  label="Tên tuyến đường"
                  rules={[
                     {
                        required: true,
                        message: 'Vui lòng nhập tên tuyến đường!',
                     },
                     {
                        min: 3,
                        message: 'Tên tuyến đường phải có ít nhất 3 ký tự!',
                     },
                     {
                        max: 100,
                        message: 'Tên tuyến đường không được vượt quá 100 ký tự!',
                     },
                  ]}
               >
                  <Input size="large" placeholder="Nhập tên tuyến đường" />
               </Form.Item>
            </Col>
            <Col span={12}>
               <Form.Item
                  name="route_duration"
                  label="Thời gian di chuyển (phút)"
                  rules={[
                     {
                        required: true,
                        message: 'Vui lòng nhập thời gian di chuyển!',
                     },
                     {
                        validator: async (_, value) => {
                           const num = Number(value);
                           if (isNaN(num)) {
                              throw new Error('Thời gian di chuyển phải là số!');
                           }
                           if (num < 1) {
                              throw new Error('Thời gian di chuyển phải lớn hơn 0!');
                           }
                           if (num > 1440) {
                              throw new Error('Thời gian di chuyển không được vượt quá 24 giờ!');
                           }
                        },
                     },
                  ]}
               >
                  <Input type="number" size="large" placeholder="Nhập thời gian di chuyển" min={1} max={1440} />
               </Form.Item>
            </Col>
            <Col span={12}>
               <Form.Item
                  name="route_distance"
                  label="Khoảng cách (km)"
                  rules={[
                     {
                        required: true,
                        message: 'Vui lòng nhập khoảng cách!',
                     },
                     {
                        validator: async (_, value) => {
                           const distance = Number(value);

                           if (isNaN(distance)) {
                              throw new Error('Khoảng cách phải là số!');
                           }

                           // Kiểm tra số thập phân
                           const decimalPlaces = value.toString().split('.')[1]?.length || 0;
                           if (decimalPlaces > 1) {
                              throw new Error('Khoảng cách chỉ được phép có 1 số thập phân!');
                           }

                           if (distance < 0.1) {
                              throw new Error('Khoảng cách phải lớn hơn 0.1km!');
                           }

                           if (distance > 1000) {
                              throw new Error('Khoảng cách không được vượt quá 1000km!');
                           }
                        },
                     },
                  ]}
               >
                  <Input type="number" size="large" placeholder="Nhập khoảng cách" min={0.1} max={1000} step={0.1} />
               </Form.Item>
            </Col>
            <Col span={12}>
               <Form.Item
                  name="route_price"
                  label="Giá vé"
                  rules={[
                     {
                        required: true,
                        message: 'Vui lòng nhập giá vé!',
                     },
                     {
                        validator: async (_, value) => {
                           const price = Number(value);

                           if (isNaN(price)) {
                              throw new Error('Giá vé phải là số!');
                           }

                           // Kiểm tra có phải là số nguyên
                           if (!Number.isInteger(price)) {
                              throw new Error('Giá vé phải là số nguyên!');
                           }

                           // Kiểm tra giá trị tối thiểu
                           if (price < 1000) {
                              throw new Error('Giá vé phải lớn hơn 1,000 VNĐ!');
                           }

                           // Kiểm tra giá trị tối đa
                           if (price > 10000000) {
                              throw new Error('Giá vé không được vượt quá 10,000,000 VNĐ!');
                           }

                           // Kiểm tra bội số của 1000
                           if (price % 1000 !== 0) {
                              throw new Error('Giá vé phải là bội số của 1,000 VNĐ!');
                           }
                        },
                     },
                  ]}
               >
                  <Input type="number" size="large" placeholder="Nhập giá vé" min={1000} max={10000000} step={1000} />
               </Form.Item>
            </Col>
            <Col span={12}>
               <Form.Item<Route>
                  name="is_default"
                  label="Tuyến mặc định"
                  rules={[{ required: true, message: 'Vui lòng chọn trạng thái mặc định!' }]}
               >
                  <Radio.Group size="large" optionType="button" buttonStyle="solid">
                     <Radio value={1}>Có</Radio>
                     <Radio value={0}>Không</Radio>
                  </Radio.Group>
               </Form.Item>
            </Col>
            <Col span={12}>
               <Form.Item<Route>
                  name="is_locked"
                  label="Trạng thái khóa"
                  rules={[{ required: true, message: 'Vui lòng chọn trạng thái khóa!' }]}
               >
                  <Radio.Group size="large" optionType="button" buttonStyle="solid">
                     <Radio value={1}>Khóa</Radio>
                     <Radio value={0}>Mở</Radio>
                  </Radio.Group>
               </Form.Item>
            </Col>
         </Row>
      </Form>
   );

   return (
      <Modal
         title={<p style={{ fontSize: '28px', fontWeight: 'bold' }}>{title}</p>}
         open={show}
         onOk={() => handleOk()}
         onCancel={handleCancel}
         width={1000}
         centered
         destroyOnClose
      >
         <Spin size="large" spinning={loading} tip={isCreate ? 'Đang tạo...' : 'Đang cập nhật...'}>
            {content}
         </Spin>
      </Modal>
   );
}
