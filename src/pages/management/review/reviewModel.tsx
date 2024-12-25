import { Review } from './entity';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { App, Form, Modal, Input, Radio, Space, Select, Flex, Typography, Upload, Spin, Tooltip } from 'antd';
import UploadIllustration from '@/components/upload/upload-illustration';
import reviewAPI from '@/redux/api/services/reviewAPI';
import { RootState } from '@/redux/stores/store';
import { setOfficesSlice } from '@/redux/slices/officeSlice';

const { Search } = Input;

export type ReviewModalProps = {
   formValue: Review;
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

export function ReviewModal({ formValue, title, show, onOk, onCancel, isCreate }: ReviewModalProps) {
   const [form] = Form.useForm();
   const { notification } = App.useApp();
   const [fileList, setFileList] = useState<UploadFile[]>([]);
   const [previewOpen, setPreviewOpen] = useState(false);
   const [previewImage, setPreviewImage] = useState('');
   const [previewTitle, setPreviewTitle] = useState('');
   const [loading, setLoading] = useState(false);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [locationData, setLocationData] = useState<{ lat: number; lng: number; link: string } | null>(null);

   const handleOpenModal = () => setIsModalOpen(true);
   const handleCloseModal = () => setIsModalOpen(false);
   const handleCancelUpload = () => setPreviewOpen(false);
   const handlePreviewUpload = async (file: UploadFile) => {
      if (!file.url && !file.preview) {
         file.preview = await getBase64(file.originFileObj as RcFile);
      }
      setPreviewImage(file.url || (file.preview as string));
      setPreviewOpen(true);
      setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
   };

   const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => setFileList(newFileList);

   const uploadButton = (
      <Tooltip placement="top" title="Drop or Select file">
         <div className="flex flex-col items-center justify-center p-0 opacity-100 hover:opacity-80">
            <UploadIllustration />
         </div>
      </Tooltip>
   );


   const handleOk = () => {
      form
         .validateFields()
         .then((formData) => {
            const additionalData = {
               reviewId: formValue.review_id,
               images: fileList.map((file) => file.originFileObj),
               map_url: formData.mapUrl,
            };
            const combinedData = { ...formData, ...additionalData };
            if (isCreate) {
               setLoading(true);
               reviewAPI
                  .createReview(combinedData)
                  .then((res) => {
                     if (res && (res.status === 201 || res.status === 200)) {
                        notification.success({
                           message: 'Create review Success !',
                           duration: 3,
                        });
                        onOk();
                     }
                     if (res && (res.error === true || res.status === 400 || res.status === 404)) {
                        notification.warning({
                           message: 'Create review Failed ! Please try again',
                           duration: 3,
                        });
                     }
                  })
                  .catch((error) => {
                     notification.error({
                        message: `Create review Failed: ${error.message}`,
                        duration: 3,
                     });
                  })
                  .finally(() => {
                     setLoading(false);
                  });
            } else {
               // Trạng thái cập nhật. isCreate = false
               setLoading(true);
               reviewAPI
                  .updateReview(combinedData)
                  .then((res) => {
                     if (res && (res.status === 201 || res.status === 200)) {
                        notification.success({
                           message: 'Update review Success !',
                           duration: 3,
                        });
                        onOk();
                     }
                     if (res && (res.error === true || res.status === 400 || res.status === 404)) {
                        notification.warning({
                           message: 'Update review Failed ! Please try again',
                           duration: 3,
                        });
                     }
                  })
                  .catch((error) => {
                     notification.error({
                        message: `Update review Failed: ${error.message}`,
                        duration: 3,
                     });
                  })
                  .finally(() => {
                     setLoading(false);
                  });
            }
         })
         .catch((errorInfo) => {
            const errorFields = errorInfo.errorFields.map((field: any) => field.name.join(' '));
            notification.warning({
               message: `Validation Data: \n${errorFields}`,
               duration: 3,
            });
         });
   };

   const content = (
      <Form<Review>
         initialValues={formValue}
         form={form}
         labelCol={{ span: 4 }}
         wrapperCol={{ span: 18 }}
         layout="horizontal"
         style={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
         {/* <Form.Item<Review> label="Name" name="name" rules={[{ required: true, message: 'Please enter the name' }]}>
            <Input size="large" />
         </Form.Item>
         <Form.Item<Review> label="Phone" name="phone" rules={[{ required: true, message: 'Please enter the phone number' }]}>
            <Input size="large" placeholder="Phone" />
         </Form.Item>
         <Form.Item<Review> label="Fax" name="fax">
            <Input size="large" placeholder="Fax" />
         </Form.Item>
         <Form.Item<Review> label="Google Maps URL" name="mapUrl" rules={[{ required: true, message: 'Please enter the Google Maps URL' }]}>
            <Search size="large" addonBefore="https://" onSearch={handleOpenModal} enterButton="Search Map" readOnly />
         </Form.Item>
         <Form.Item<Review> label="Latitude" name="latitude" rules={[{ required: true, message: 'Please enter the latitude' }]}>
            <Input size="large" placeholder="Latitude" readOnly />
         </Form.Item>
         <Form.Item<Review> label="Longitude" name="longitude" rules={[{ required: true, message: 'Please enter the longitude' }]}>
            <Input size="large" placeholder="Longitude" readOnly />
         </Form.Item>
         <Form.Item<Review> label="Description" name="description" rules={[{ required: true, message: 'Please enter the description' }]}>
            <Input.TextArea size="large" />
         </Form.Item>
         <Form.Item<Review> label="Locked" name="isLocked" rules={[{ required: true, message: 'Please select a status' }]}>
            <Radio.Group size="large" optionType="button" buttonStyle="solid">
               <Radio value={1}>Enable</Radio>
               <Radio value={0}>Disable</Radio>
            </Radio.Group>
         </Form.Item>
         <Form.Item<Review> label="Image">
            <Upload
               style={{ flex: 1 }}
               listType="picture-card"
               fileList={fileList}
               multiple
               beforeUpload={() => false}
               onPreview={handlePreviewUpload}
               onChange={handleChange}
               maxCount={8}
               progress={{
                  strokeColor: {
                     '0%': '#108ee9',
                     '100%': '#87d068',
                  },
               }}
            >
               {fileList.length >= 8 ? null : uploadButton}
            </Upload>
            <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancelUpload}>
               <img alt="example" style={{ width: '100%' }} src={previewImage} />
            </Modal>
         </Form.Item> */}
      </Form>
   );

   return (
      <>
         {/* <MapModal isOpen={isModalOpen} onClose={handleCloseModal} onSaveLocation={handleSaveLocation} /> */}
         <Modal
            title={title}
            open={show}
            onOk={handleOk}
            onCancel={() => {
               onCancel();
            }}
            destroyOnClose
            width="60%"
            centered
         >
            {loading && (
               <Spin size="large" fullscreen tip={isCreate ? 'Creating...' : 'Updating...'}>
                  {content}
               </Spin>
            )}
            {content}
         </Modal>
      </>
   );
}
