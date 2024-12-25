import { Form, Modal, Input, DatePicker, Row, Col, Card, App } from 'antd';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/stores/store';
import { Voucher } from './entity';
import {  setVouchersSlice} from '@/redux/slices/voucherSlice';
import { useDispatch } from 'react-redux';
import voucherAPI from '@/redux/api/services/voucherAPI';


interface VoucherModalProps {
   formValue: Partial<Voucher>;
   title: string;
   show: boolean;
   onOk: () => void;
   onCancel: () => void;
   isCreate: boolean;
}

export function VoucherModal({ formValue, title, show, onOk, onCancel, isCreate }: VoucherModalProps) {
   const [form] = Form.useForm();
   const dispatch = useDispatch();
   const { notification } = App.useApp();
   const [loading, setLoading] = useState(false);
   const [previewData, setPreviewData] = useState({
      discount: 0,
      maxAmount: 0,
      usageLimit: 0,
   });

   const userInfo = useSelector((state: RootState) => state.user.userInfo);
   useEffect(() => {
      if (show && !isCreate) {
         const validFrom = formValue.voucher_valid_from ? dayjs(new Date(formValue.voucher_valid_from)) : null;
         const validTo = formValue.voucher_valid_to ? dayjs(new Date(formValue.voucher_valid_to)) : null;

         form.setFieldsValue({
            ...formValue,
            voucher_valid_from: validFrom,
            voucher_valid_to: validTo,
         });
         setPreviewData({
            discount: formValue.voucher_discount_percentage || 0,
            maxAmount: formValue.voucher_discount_max_amount || 0,
            usageLimit: formValue.voucher_usage_limit || 0,
         });
      }
   }, [show, isCreate, form, formValue]);

   useEffect(() => {
      if (!show) {
         form.setFieldsValue({
            voucher_code: null,
            voucher_discount_percentage: null,
            voucher_discount_max_amount: null,
            voucher_usage_limit: null,
            voucher_valid_from: null,
            voucher_valid_to: null
         });
         setPreviewData({ discount: 0, maxAmount: 0, usageLimit: 0 });
      }
   }, [show, form]);

   const handleFormChange = () => {
      const values = form.getFieldsValue();
      setPreviewData({
         discount: values.voucher_discount_percentage || 0,
         maxAmount: values.voucher_discount_max_amount || 0,
         usageLimit: values.voucher_usage_limit || 0,
      });
   };

   const handleOk = async () => {
      form.validateFields().then(async (values) => {
         if(values.voucher_valid_from && values.voucher_valid_to) {
            if(values.voucher_valid_from > values.voucher_valid_to) {
               notification.error({ message: 'Thời gian bắt đầu không được lớn hơn thời gian kết thúc!' });
               return;
            }
            if(values.voucher_valid_from < dayjs().startOf('day')) {
               notification.error({ message: 'Thời gian bắt đầu không được nhỏ hơn ngày hiện tại!' });
               return;
            }
            if(values.voucher_valid_to < dayjs().startOf('day')) {
               notification.error({ message: 'Thời gian kết thúc không được nhỏ hơn ngày hiện tại!' });
               return;
            }
            if(values.voucher_valid_from > values.voucher_valid_to) {
               notification.error({ message: 'Thời gian bắt đầu không được lớn hơn thời gian kết thúc!' });
               return;
            }
            if(values.voucher_valid_from && values.voucher_valid_to && values.voucher_valid_from > values.voucher_valid_to) {
               notification.error({ message: 'Thời gian bắt đầu không được lớn hơn thời gian kết thúc!' });
               return;
            }
            const data ={
               voucher_id: formValue.voucher_id || null,
               voucher_code: values.voucher_code,
               voucher_discount_percentage: values.voucher_discount_percentage,
               voucher_discount_max_amount: values.voucher_discount_max_amount,
               voucher_usage_limit: values.voucher_usage_limit,
               voucher_valid_from: values.voucher_valid_from,
               voucher_valid_to: values.voucher_valid_to,
               voucher_created_by: userInfo?.userId,
            }
            setLoading(true);
            if(isCreate) {
               await voucherAPI.createVoucher(data).then((res) => {
                  if((res.status === 200 || res.status === 201) && res) {
                     dispatch(setVouchersSlice(res.data));
                     notification.success({ message: 'Tạo voucher thành công!', description: 'Voucher đã được tạo thành công!', duration: 3 });
                  }
                  onOk();
               }).catch((err) => {
                  notification.error({ message: 'Có lỗi xảy ra!', description: 'Voucher không được tạo! ' + err.message, duration: 3 });
               }).finally(() => {
                  setLoading(false);
               });
            } else {
               await voucherAPI.updateVoucher(data).then((res) => {
                  if((res.status === 200 || res.status === 201) && res) {
                     dispatch(setVouchersSlice(res.data));
                     notification.success({ message: 'Cập nhật voucher thành công!', description: 'Voucher đã được cập nhật thành công!', duration: 3 });
                  }
                  onOk();
               }).catch((err) => {
                  notification.error({ message: 'Có lỗi xảy ra!', description: 'Voucher không được cập nhật! ' + err.message, duration: 3 });
               }).finally(() => {
                  setLoading(false);
               });
            }
         }
      });
   };

   const content = (
      <Row gutter={16}>
         <Col span={12}>
            <Form<Voucher> form={form} layout="vertical" initialValues={formValue} onValuesChange={handleFormChange}>
               <Form.Item
                  label="Mã voucher"
                  name="voucher_code"
                  rules={[
                     { required: true, message: 'Vui lòng nhập mã voucher!' },
                     { min: 3, message: 'Mã voucher phải có ít nhất 3 ký tự!' },
                     { max: 50, message: 'Mã voucher không được quá 50 ký tự!' },
                  ]}
               >
                  <Input size="large" placeholder="Nhập mã voucher" />
               </Form.Item>
               <Form.Item
   label="Phần trăm giảm" 
   name="voucher_discount_percentage"
   rules={[
      { required: true, message: 'Vui lòng nhập phần trăm giảm!' },
      { 
        validator: async (_, value) => {
          const numberValue = Number(value);
          if (isNaN(numberValue) || numberValue < 0 || numberValue > 100) {
            return Promise.reject(new Error('Phần trăm giảm phải từ 0-100!'));
          }
          if (!Number.isInteger(numberValue)) {
            return Promise.reject(new Error('Phần trăm giảm phải là số nguyên!'));
          }
          return Promise.resolve();
        }
      }
   ]}
>
   <Input size="large" type="number" addonAfter="%" placeholder="Nhập phần trăm giảm" />
</Form.Item>
               <Form.Item
                  label="Hóa đơn tối thiểu"
                  name="voucher_discount_max_amount"
                  rules={[
                     { required: true, message: 'Vui lòng nhập số tiền giảm tối thiểu!' },
                     { 
                        validator: async (_, value) => {
                           const numberValue = Number(value);
                           if (isNaN(numberValue) || numberValue < 0) {
                              return Promise.reject(new Error('Số tiền giảm phải lớn hơn 0!'));
                           }
                           return Promise.resolve();
                        }
                     }
                  ]}
               >
                  <Input size="large" type="number" min={0} addonAfter="VNĐ" placeholder="Nhập hóa đơn tối thiểu" />
               </Form.Item>
               <Form.Item
   label="Số lượng sử dụng"
   name="voucher_usage_limit"
   rules={[
      { required: true, message: 'Vui lòng nhập số lượng!' },
      { 
        validator: async (_, value) => {
          const numberValue = Number(value);
          if(!numberValue) {
            return;
          }
          if (numberValue && isNaN(numberValue) || numberValue < 1) {
            return Promise.reject(new Error('Số lượng phải lớn hơn 0!'));
          }
          return Promise.resolve();
        }
      }
   ]}
>
   <Input size="large" type="number" min={1} placeholder="Nhập số lượng có thể sử dụng" />
</Form.Item>
               <Form.Item
                  label="Thời gian bắt đầu"
                  name="voucher_valid_from"
                  rules={[{ required: true, message: 'Vui lòng chọn thời gian bắt đầu!' }]}
               >
                  <DatePicker
                     size="large"
                     showTime
                     format="YYYY-MM-DD HH:mm:ss"
                     style={{ width: '100%' }}
                     placeholder="Chọn thời gian bắt đầu"
                     disabledDate={(current) => {
                        const validFrom = form.getFieldValue('voucher_valid_from');
                        return current && current < dayjs().startOf('day');
                     }}
                  />
               </Form.Item>
               <Form.Item
                  label="Thời gian kết thúc"
                  name="voucher_valid_to"
                  rules={[{ required: true, message: 'Vui lòng chọn thời gian kết thúc!' }]}
               >
                  <DatePicker
                     size="large"
                     showTime
                     format="YYYY-MM-DD HH:mm:ss"
                     style={{ width: '100%' }}
                     placeholder="Chọn thời gian kết thúc"
                     disabledDate={(current) => {
                        const validFrom = form.getFieldValue('voucher_valid_from');
                        return current && (current < dayjs().startOf('day') || (validFrom && current.isBefore(validFrom, 'day')));
                     }}
                  />
               </Form.Item>
            </Form>
         </Col>

         {/* Preview Section */}
         <Col span={12}>
            <Card title="Preview Voucher" bordered>
               <p>
                  <strong>Phần trăm giảm:</strong> {previewData.discount}%
               </p>
               <p>
                  <strong>Số tiền giảm tối đa:</strong> {previewData.maxAmount.toLocaleString()} VNĐ
               </p>
               <p>
                  <strong>Số lượng sử dụng:</strong> {previewData.usageLimit}
               </p>
            </Card>
         </Col>
      </Row>
   );

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
         confirmLoading={loading}
         destroyOnClose
      >
         {content}
      </Modal>
   );
}
