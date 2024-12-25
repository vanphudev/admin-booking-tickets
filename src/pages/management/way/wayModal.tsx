import { useState, useEffect } from 'react';
import { Form, Modal, Input, Select, Button, Space, App, Row, Col, InputNumber, Spin } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import officeAPI from '@/redux/api/services/officeAPI';
import wayAPI from '@/redux/api/services/wayAPI';
import Iconify from '@/components/icon/iconify-icon';

export interface WayModalProps {
   formValue: any;
   title: string;
   show: boolean;
   onOk: () => void;
   onCancel: () => void;
   isCreate: boolean;
}

export function WayModal({ formValue, title, show, onOk, onCancel, isCreate }: WayModalProps) {
   const [form] = Form.useForm();
   const { notification, modal } = App.useApp();
   const [middlePoints, setMiddlePoints] = useState<any[]>([]);
   const cardColors = ['#fff6e5', '#e6f7ff', '#f6ffed', '#fff1f0', '#f9f0ff'];
   const [listOffice, setListOffice] = useState<any[]>([]);
   const [loading, setLoading] = useState(false);
   const [originalListOffice, setOriginalListOffice] = useState<any[]>([]);

   useEffect(() => {
      if (show && formValue) {
         // Phân loại các điểm theo pickup_point_kind
         const points = formValue.list_pickup_point?.reduce((acc: any, point: any) => {
            // eslint-disable-next-line default-case
            switch (point.pickup_point_kind) {
               case -1: // Điểm xuất phát
                  acc.start_point = {
                     office_id: point.office_id,
                     pickup_point_name: point.pickup_point_name,
                     pickup_point_time: point.pickup_point_time,
                     pickup_point_description: point.pickup_point_description,
                  };
                  break;
               case 1: // Điểm đến
                  acc.end_point = {
                     office_id: point.office_id,
                     pickup_point_name: point.pickup_point_name,
                     pickup_point_time: point.pickup_point_time,
                     pickup_point_description: point.pickup_point_description,
                  };
                  break;
               case 0: // Điểm trung gian
                  if (!acc.middle_points) acc.middle_points = [];
                  acc.middle_points.push({
                     office_id: point.office_id,
                     pickup_point_name: point.pickup_point_name,
                     pickup_point_time: point.pickup_point_time,
                     pickup_point_description: point.pickup_point_description,
                  });
                  break;
            }
            return acc;
         }, {});

         // Set giá trị form
         const formData = {
            way_name: formValue.way_name,
            way_description: formValue.way_description,
            start_point: {
               ...points?.start_point,
               pickup_point_time: 0
            },
            end_point: points?.end_point,
            middle_points: points?.middle_points || [],
         };

         form.setFieldsValue(formData);
         if (points?.middle_points) {
            setMiddlePoints(points.middle_points);
         }
      }
   }, [show, formValue]);

   useEffect(() => {
      form.setFieldValue('middle_points', middlePoints);
   }, [middlePoints]);

   const handleOk = () => {
      form
         .validateFields()
         .then((values) => {
            setLoading(true);
            
            const listPickupPoints = [];

            // Thêm điểm đi (luôn có time = 0)
            listPickupPoints.push({
               ...values.start_point,
               pickup_point_time: 0,
               pickup_point_kind: -1,
            });

            // Thêm các điểm trung gian
            if (values.middle_points?.length > 0) {
               values.middle_points.forEach((point: any) => {
                  listPickupPoints.push({
                     ...point,
                     pickup_point_kind: 0,
                  });
               });
            }

            // Thêm điểm đến
            listPickupPoints.push({
               ...values.end_point,
               pickup_point_kind: 1,
            });

            const payload = {
               way_id: formValue?.way_id || null,
               way_name: values.way_name.trim(),
               way_description: values.way_description.trim(),
               list_pickup_point: listPickupPoints,
            };

            if (isCreate) {
               wayAPI.createWay(payload)
                  .then((response) => {
                     console.log(response);
                     if (response) {
                        notification.success({
                           message: 'Thành công',
                           description: 'Tạo tuyến đường mới thành công!',
                        });
                        onOk();
                        form.resetFields();
                     }
                     if (!response) {
                        notification.error({
                           message: 'Có lỗi xảy ra!',
                           description: response.message || 'Không thể tạo tuyến đường mới!',
                           icon: <Iconify icon="mingcute:alert-fill" style={{ color: '#ff4d4f' }} />,
                     });
                     }
                  })
                  .catch((error) => {
                     notification.error({
                        message: 'Có lỗi xảy ra!',
                        description: error.message || 'Không thể tạo tuyến đường mới!',
                        icon: <Iconify icon="mingcute:alert-fill" style={{ color: '#ff4d4f' }} />,
                     });
                  })
                  .finally(() => {
                     setLoading(false);
                  });
            } else {
               wayAPI.updateWay(payload)
                  .then((response) => {
                     if (response) {
                        notification.success({
                           message: 'Thành công',
                           description: 'Cập nhật tuyến đường thành công!',
                        });
                        onOk();
                        form.resetFields();
                     }
                     if (!response) {
                        notification.error({
                           message: 'Có lỗi xảy ra!',
                           description: response.message || 'Không thể cập nhật tuyến đường!',
                           icon: <Iconify icon="mingcute:alert-fill" style={{ color: '#ff4d4f' }} />,
                        });
                     }
                  })
                  .catch((error) => {
                     notification.error({
                        message: 'Có lỗi xảy ra!',
                        description: error.message || 'Không thể cập nhật tuyến đường!',
                        icon: <Iconify icon="mingcute:alert-fill" style={{ color: '#ff4d4f' }} />,
                     });
                  })
                  .finally(() => {
                     setLoading(false);
                  });
            }
         })
         .catch((error) => {
            // Form validation failed
            console.log('Validation failed:', error);
         });
   };

   useEffect(() => {
      const fetchOffices = async () => {
         try {
            const response = await officeAPI.getOffices();
            if (Array.isArray(response)) {
               setOriginalListOffice(response);
               setListOffice(response);
            } else {
               console.error('Response không phải là mảng:', response);
            }
         } catch (error) {
            console.error('Error fetching offices:', error);
            notification.error({
               message: 'Lỗi',
               description: 'Không thể tải danh sách văn phòng',
               icon: <Iconify icon="mingcute:alert-fill" style={{ color: '#ff4d4f' }} />,
            });
         }
      };

      if (show) {
         fetchOffices();
      }
   }, [show]);


   useEffect(() => {
      const middlePoints = form.getFieldValue('middle_points');
      if (middlePoints?.length > 0) {
         middlePoints.forEach((_: any, index: number) => {
            form.validateFields([[`middle_points`, index, 'pickup_point_time']]).catch(() => {});
         });
      }
   }, [form.getFieldValue('middle_points')]);

   const validateExistingMiddlePoints = () => {
      const middlePoints = form.getFieldValue('middle_points') || [];
      const invalidPoints = middlePoints.filter((point: any) => {
         return (
            !point.office_id ||
            !point.pickup_point_name ||
            point.pickup_point_time === undefined ||
            point.pickup_point_time === null
         );
      });

      return invalidPoints.length === 0;
   };

   // Hàm để lấy danh sách các office_id đã được chọn
   const getSelectedOfficeIds = () => {
      const startOfficeId = form.getFieldValue(['start_point', 'office_id']);
      const endOfficeId = form.getFieldValue(['end_point', 'office_id']);
      const middlePoints = form.getFieldValue('middle_points') || [];
      const middleOfficeIds = middlePoints.map((point: any) => point.office_id);

      return [startOfficeId, endOfficeId, ...middleOfficeIds].filter(Boolean);
   };

   // Sử dụng useEffect để cập nhật danh sách văn phòng khi có sự thay đổi
   useEffect(() => {
      const selectedOfficeIds = getSelectedOfficeIds();
      const filteredOffices = originalListOffice.filter(office => !selectedOfficeIds.includes(office.office_id));
      setListOffice(filteredOffices);
   }, [form.getFieldValue('start_point'), form.getFieldValue('end_point'), form.getFieldValue('middle_points')]);

   // Cập nhật hàm handleAddMiddlePoint
   const handleAddMiddlePoint = () => {
      if (!validateExistingMiddlePoints()) {
         modal.warning({
            title: 'Thông báo',
            content: 'Vui lòng nhập đầy đủ thông tin cho các điểm trung gian hiện tại trước khi thêm mới!',
            okText: 'Đồng ý',
            centered: true,
         });
         return;
      }
      const currentMiddlePoints = form.getFieldValue('middle_points') || [];
      const maxTime = currentMiddlePoints.length > 0 
         ? Math.max(...currentMiddlePoints.map((point: any) => point.pickup_point_time || 0))
         : 0;

      const newPoint = {
         office_id: undefined,
         pickup_point_name: '',
         pickup_point_time: maxTime,
         pickup_point_description: '',
      };

      const updatedMiddlePoints = [...currentMiddlePoints, newPoint];
      setMiddlePoints(updatedMiddlePoints);
      form.setFieldValue('middle_points', updatedMiddlePoints);
      form.setFieldValue(['end_point', 'pickup_point_time'], maxTime);
   };

   const handleRemoveMiddlePoint = (index: number) => {
      const currentMiddlePoints = form.getFieldValue('middle_points') || [];
      const updatedMiddlePoints = currentMiddlePoints.filter((_: any, i: number) => i !== index);
      setMiddlePoints(updatedMiddlePoints);
      form.setFieldValue('middle_points', updatedMiddlePoints);
      const maxTime = updatedMiddlePoints.length > 0 
         ? Math.max(...updatedMiddlePoints.map((point: any) => point.pickup_point_time || 0))
         : 0;
      form.setFieldValue(['end_point', 'pickup_point_time'], maxTime);
   };

   useEffect(() => {
      if (show) {
         form.setFieldsValue(formValue);
      }
   }, [show, formValue]);

   useEffect(() => {
      if (!show) {
         setMiddlePoints([]);
         form.resetFields();
      }
   }, [show]);

   // Thêm hàm xử lý khi chọn văn phòng
   const handleOfficeSelect = (officeId: string, type: 'start_point' | 'end_point' | 'middle_points', index?: number) => {
      const selectedOffice = originalListOffice.find(office => office.office_id === officeId);
      if (selectedOffice) {
         if (type === 'middle_points' && index !== undefined) {
            form.setFieldValue(['middle_points', index, 'pickup_point_name'], selectedOffice.office_name);
            form.setFieldValue(['middle_points', index, 'pickup_point_description'], '');
         } else {
            form.setFieldValue([type, 'pickup_point_name'], selectedOffice.office_name);
            form.setFieldValue([type, 'pickup_point_description'], '');
         }

         const selectedIds = getSelectedOfficeIds();
         const filteredOffices = originalListOffice.filter(office => !selectedIds.includes(office.office_id));
         setListOffice(filteredOffices);
      }
   };

   // Điều chỉnh hàm validate thời gian - bỏ kiểm tra số âm
   const validateTime = (value: number | null) => {
      if (value === null || value === undefined) return false;
      if (!Number.isInteger(value)) return false;
      return true;
   };

   return (
      <Modal
         title={title}
         open={show}
         onOk={handleOk}
         onCancel={() => {
            onCancel();
         }}
         width="60%"
         centered
         destroyOnClose
         confirmLoading={loading}
         maskClosable={false}
         style={{ maxHeight: '80vh' }}
      >
         <Spin spinning={loading} tip="Đang xử lý..." size="large" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            <Form
               form={form}
               layout="vertical"
               initialValues={formValue}
               style={{ maxHeight: 'calc(80vh - 120px)' }}
            >
               <Row gutter={16} style={{ height: '100%', margin: '0px' }}>
                  <Col 
                     span={12} 
                     style={{ 
                        height: 'calc(80vh - 120px)',
                        paddingRight: '8px'
                     }}
                  >
                     <div style={{ height: '100%' }}>
                        <Form.Item
                           name="way_name"
                           label="Tên tuyến đường"
                           rules={[{ required: true, message: 'Vui lòng nhập tên tuyến đường!' }]}
                        >
                           <Input size="large" placeholder="Nhập tên tuyến đường" />
                        </Form.Item>
                        <Form.Item
                           name="way_description"
                           label="Mô tả tuyến đường"
                           rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
                        >
                           <Input.TextArea rows={4} size="large" placeholder="Nhập mô tả tuyến đường" />
                        </Form.Item>

                        <div style={{ border: '1px solid #f0f0f0', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                           <h3>Điểm đi</h3>
                           <Row gutter={16}>
                              <Col span={16}>
                                 <div style={{ marginBottom: '8px' }}>Chọn văn phòng</div>
                                 <Form.Item
                                    name={['start_point', 'office_id']}
                                    rules={[{ required: true, message: 'Vui lòng chọn văn phòng điểm đi!' }]}
                                 >
                                    <Select 
                                       size="large" 
                                       placeholder="Chọn văn phòng điểm đi"
                                       onChange={(value) => handleOfficeSelect(value, 'start_point')}
                                       value={form.getFieldValue(['start_point', 'office_id'])}
                                    >
                                       {(form.getFieldValue(['start_point', 'office_id']) 
                                          ? [...listOffice, originalListOffice.find(o => o.office_id === form.getFieldValue(['start_point', 'office_id']))]
                                          : listOffice
                                       ).map((office) => (
                                          <Select.Option key={office.office_id} value={office.office_id}>
                                             {office.office_name}
                                          </Select.Option>
                                       ))}
                                    </Select>
                                 </Form.Item>
                              </Col>
                              <Col span={8}>
                                 <div style={{ marginBottom: '8px' }}>Thời gian (phút)</div>
                                 <Form.Item
                                    name={['start_point', 'pickup_point_time']}
                                    rules={[
                                       { required: true, message: 'Vui lòng nhập thời gian!' },
                                       { type: 'number', message: 'Thời gian phải là số!' }
                                    ]}
                                 >
                                    <InputNumber
                                       disabled
                                       size="large"
                                       precision={0}
                                       style={{ width: '100%' }}
                                       parser={(value) => (value ? Math.round(Number(value)) : 0)}
                                       formatter={(value) => `${value}`}
                                       onKeyPress={(event) => {
                                          if (!/[0-9-]/.test(event.key)) {  // Thêm dấu - vào regex
                                             event.preventDefault();
                                          }
                                       }}
                                    />
                                 </Form.Item>
                              </Col>
                           </Row>
                           <Form.Item hidden name={['start_point', 'pickup_point_name']} />
                           <Form.Item hidden name={['start_point', 'pickup_point_description']} />
                        </div>

                        <div style={{ border: '1px solid #f0f0f0', padding: '16px', borderRadius: '8px' }}>
                           <h3>Điểm đến</h3>
                           <Row gutter={16}>
                              <Col span={16}>
                                 <div style={{ marginBottom: '8px' }}>Chọn văn phòng</div>
                                 <Form.Item
                                    name={['end_point', 'office_id']}
                                    rules={[{ required: true, message: 'Vui lòng chọn văn phòng điểm đến!' }]}
                                 >
                                    <Select 
                                       size="large" 
                                       placeholder="Chọn văn phòng điểm đến"
                                       onChange={(value) => handleOfficeSelect(value, 'end_point')}
                                       value={form.getFieldValue(['end_point', 'office_id'])}
                                    >
                                       {(form.getFieldValue(['end_point', 'office_id']) 
                                          ? [...listOffice, originalListOffice.find(o => o.office_id === form.getFieldValue(['end_point', 'office_id']))]
                                          : listOffice
                                       ).map((office) => (
                                          <Select.Option key={office.office_id} value={office.office_id}>
                                             {office.office_name}
                                          </Select.Option>
                                       ))}
                                    </Select>
                                 </Form.Item>
                              </Col>
                              <Col span={8}>
                                 <div style={{ marginBottom: '8px' }}>Thời gian (phút)</div>
                                 <Form.Item
                                    name={['end_point', 'pickup_point_time']}
                                    rules={[
                                       { required: true, message: 'Vui lòng nhập thời gian!' },
                                       { type: 'number', message: 'Thời gian phải là số!' }
                                    ]}
                                 >
                                    <InputNumber
                                       size="large"
                                       precision={0}
                                       style={{ width: '100%' }}
                                       parser={(value) => (value ? Math.round(Number(value)) : 0)}
                                       formatter={(value) => `${value}`}
                                       onKeyPress={(event) => {
                                          if (!/[0-9-]/.test(event.key)) {  // Thêm dấu - vào regex
                                             event.preventDefault();
                                          }
                                       }}
                                    />
                                 </Form.Item>
                              </Col>
                           </Row>
                           <Form.Item hidden name={['end_point', 'pickup_point_name']} />
                           <Form.Item hidden name={['end_point', 'pickup_point_description']} />
                        </div>
                     </div>
                  </Col>
                  <Col 
                     span={12} 
                     style={{ 
                        height: 'calc(80vh - 120px)',
                        overflowY: 'auto',
                        paddingLeft: '8px'
                     }}
                  >
                     <div
                        style={{
                           border: '1px solid #f0f0f0',
                           padding: '16px',
                           borderRadius: '8px',
                           position: 'relative',
                        }}
                     >
                        <div
                           style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '16px',
                              position: 'sticky',
                              top: 0,
                              backgroundColor: 'white',
                              zIndex: 1,
                              padding: '8px 0',
                              borderBottom: '1px solid #f0f0f0',
                           }}
                        >
                           <h3 style={{ margin: 0 }}>Điểm trung gian</h3>
                           <span
                              style={{
                                 backgroundColor: '#1890ff',
                                 color: 'white',
                                 padding: '4px 12px',
                                 borderRadius: '12px',
                                 fontSize: '12px',
                              }}
                           >
                              Tổng số điểm trung gian: {middlePoints.length}
                           </span>
                        </div>

                        <Form.List name="middle_points">
                           {(fields) => (
                              <>
                                 {fields.map(({ key, name, ...restField }) => (
                                    <div
                                       key={key}
                                       style={{
                                          marginBottom: 16,
                                          padding: '16px',
                                          border: '1px solid #f0f0f0',
                                          borderRadius: '8px',
                                          position: 'relative',
                                          backgroundColor: cardColors[name % cardColors.length],
                                       }}
                                    >
                                       <div
                                          style={{
                                             position: 'absolute',
                                             left: '-10px',
                                             top: '-10px',
                                             width: '24px',
                                             height: '24px',
                                             backgroundColor: '#1890ff',
                                             color: 'white',
                                             borderRadius: '50%',
                                             display: 'flex',
                                             justifyContent: 'center',
                                             alignItems: 'center',
                                             fontSize: '12px',
                                             fontWeight: 'bold',
                                          }}
                                       >
                                          {name + 1}
                                       </div>
                                       <MinusCircleOutlined
                                          onClick={() => handleRemoveMiddlePoint(name)}
                                          style={{
                                             position: 'absolute',
                                             right: '-10px',
                                             top: '-10px',
                                             color: '#ff4d4f',
                                             fontSize: '20px',
                                             cursor: 'pointer',
                                             backgroundColor: '#fff',
                                             borderRadius: '50%',
                                             padding: '4px',
                                             boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                                          }}
                                       />
                                       <Row gutter={16}>
                                          <Col span={16}>
                                             <div style={{ marginBottom: '8px' }}>Chọn văn phòng</div>
                                             <Form.Item
                                                {...restField}
                                                name={[name, 'office_id']}
                                                rules={[{ required: true, message: 'Vui lòng chọn văn phòng!' }]}
                                             >
                                                <Select 
                                                   size="large" 
                                                   placeholder="Chọn văn phòng trung gian"
                                                   onChange={(value) => handleOfficeSelect(value, 'middle_points', name)}
                                                >
                                                   {originalListOffice
                                                      .filter(office => {
                                                         const selectedIds = getSelectedOfficeIds();
                                                         const currentValue = form.getFieldValue(['middle_points', name, 'office_id']);
                                                         return !selectedIds.includes(office.office_id) || office.office_id === currentValue;
                                                      })
                                                      .map((office) => (
                                                         <Select.Option key={office.office_id} value={office.office_id}>
                                                            {office.office_name}
                                                         </Select.Option>
                                                      ))}
                                                </Select>
                                             </Form.Item>
                                          </Col>
                                          <Col span={8}>
                                             <div style={{ marginBottom: '8px' }}>Thời gian (phút)</div>
                                             <Form.Item
                                                {...restField}
                                                name={[name, 'pickup_point_time']}
                                                rules={[
                                                   { required: true, message: 'Vui lòng nhập thời gian!' },
                                                   { 
                                                      type: 'number',
                                                      message: 'Thời gian phải là số nguyên dương!' 
                                                   },
                                                   {
                                                      validator: (_, value) => {
                                                         if (!validateTime(value)) {
                                                            return Promise.reject('Thời gian phải là số nguyên dương!');
                                                         }
                                                         return Promise.resolve();
                                                      }
                                                   }
                                                ]}
                                             >
                                                <InputNumber
                                                   size="large"
                                                   precision={0}
                                                   style={{ width: '100%' }}
                                                   parser={(value) => (value ? Math.round(Number(value)) : 0)}
                                                   formatter={(value) => `${value}`}
                                                   onKeyPress={(event) => {
                                                      if (!/[0-9-]/.test(event.key)) {  // Thêm dấu - vào regex
                                                         event.preventDefault();
                                                      }
                                                   }}
                                                />
                                             </Form.Item>
                                          </Col>
                                       </Row>
                                       <Form.Item hidden {...restField} name={[name, 'pickup_point_name']} />
                                       <Form.Item hidden {...restField} name={[name, 'pickup_point_description']} />
                                    </div>
                                 ))}
                                 <Form.Item>
                                    <Button type="dashed" onClick={handleAddMiddlePoint} block icon={<PlusOutlined />}>
                                       Thêm điểm trung gian
                                    </Button>
                                 </Form.Item>
                              </>
                           )}
                        </Form.List>
                     </div>
                  </Col>
               </Row>
            </Form>
         </Spin>
      </Modal>
   );
}
