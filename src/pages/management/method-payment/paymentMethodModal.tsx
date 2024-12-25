import { PaymentMethod } from './entity';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import { useEffect, useState } from 'react';
import { App, Form, Modal, Upload, Input, Radio, Tooltip, Spin } from 'antd';
import UploadIllustration from '@/components/upload/upload-illustration';
import paymentMethodAPI from '@/redux/api/services/paymentMethodAPI';

export type PaymentMethodModalProps = {
   formValue: PaymentMethod;
   title: string;
   show: boolean;
   onOk: VoidFunction;
   onCancel: VoidFunction;
   isCreate: boolean;
};

const getBase64 = (file: RcFile): Promise<string> =>
   new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
   });

export function PaymentMethodModal({ formValue, title, show, onOk, onCancel, isCreate }: PaymentMethodModalProps) {
   const [form] = Form.useForm();
   const { notification } = App.useApp();
   useEffect(() => {}, [show, formValue, form, isCreate]);
   const [loading, setLoading] = useState(false);

   const handleOk = () => {
      // form
      //    .validateFields()
      //    .then((formData) => {
      //       const additionalData = {
      //          payment_method_id: formValue.payment_method_id,
      //       };
      //       const combinedData = { ...formData, ...additionalData };
      //       setLoading(true);
      //       if (isCreate) {
      //          paymentMethodAPI
      //             .createPaymentMethod(combinedData)
      //             .then((res) => {
      //                if (res && (res.status === 201 || res.status === 200)) {
      //                   notification.success({ message: 'Create Payment Method Success!', duration: 3 });
      //                   onOk();
      //                }
      //             })
      //             .catch((error) => {
      //                notification.error({ message: `Create Payment Method Failed: ${error.message}`, duration: 3 });
      //             })
      //             .finally(() => {
      //                setLoading(false);
      //             });
      //       } else {
      //          paymentMethodAPI
      //             .updatePaymentMethod(combinedData)
      //             .then((res) => {
      //                if (res && (res.status === 201 || res.status === 200)) {
      //                   notification.success({ message: 'Update Payment Method Success!', duration: 3 });
      //                   onOk();
      //                }
      //             })
      //             .catch((error) => {
      //                notification.error({ message: `Update Payment Method Failed: ${error.message}`, duration: 3 });
      //             })
      //             .finally(() => {
      //                setLoading(false);
      //             });
      //       }
      //    })
      //    .catch((errorInfo) => {
      //       const errorFields = errorInfo.errorFields.map((field: any) => field.name.join(' '));
      //       notification.warning({ message: `Validation Data: \n${errorFields}`, duration: 3 });
      //    });
   };

   const content = (
      <Form<PaymentMethod>
         initialValues={formValue}
         form={form}
         labelCol={{ span: 4 }}
         wrapperCol={{ span: 20 }}
         layout="horizontal"
      >
         <Form.Item
            label="Name"
            name="payment_method_name"
            rules={[{ required: true, message: 'Please enter the name' }]}
         >
            <Input size="large" />
         </Form.Item>
         <Form.Item
            label="Code"
            name="payment_method_code"
            rules={[{ required: true, message: 'Please enter the code' }]}
         >
            <Input size="large" />
         </Form.Item>
         <Form.Item
            label="Description"
            name="payment_method_description"
            rules={[{ required: true, message: 'Please enter the description' }]}
         >
            <Input.TextArea size="large" />
         </Form.Item>
         <Form.Item label="Locked" name="isLocked" rules={[{ required: true, message: 'Please select a status' }]}>
            <Radio.Group size="large" optionType="button" buttonStyle="solid">
               <Radio value={1}>Enable</Radio>
               <Radio value={0}>Disable</Radio>
            </Radio.Group>
         </Form.Item>
      </Form>
   );

   return (
      <Modal title={title} open={show} onOk={handleOk} onCancel={onCancel} destroyOnClose width="600px" centered>
         {loading ? (
            <Spin size="large" fullscreen tip={isCreate ? 'Creating...' : 'Updating...'}>
               {content}
            </Spin>
         ) : (
            content
         )}
      </Modal>
   );
}
