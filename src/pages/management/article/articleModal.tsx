import type { Article, ArticleType } from './entity';
import type { RcFile } from 'antd/es/upload/interface';
import { useEffect, useState } from 'react';
import { App, Form, Modal, Input, Upload, Spin, Row, Col, Select, Button, message } from 'antd';
import { Iconify } from '@/components/icon';
import articleAPI from '@/redux/api/services/articleAPI';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import mammoth from 'mammoth';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/stores/store';

const styles = `
   .article-modal-avatar-uploader .ant-upload {
      width: 200px !important;
      height: 200px !important;
      background-color: #fafafa;
      border: 1px dashed #d9d9d9;
      border-radius: 8px;
      cursor: pointer;
      transition: border-color 0.3s;
   }

   .article-modal-avatar-uploader .ant-upload:hover {
      border-color: #FF3030;
   }

   .ql-container {
      min-height: 400px;
   }

   .ql-editor {
      min-height: 400px;
   }

   .article-modal .ant-modal-content {
      transition: all 0.3s ease;
   }

   .article-modal .fullscreen .ant-modal-content {
      min-height: 190vh;
      width: 90vw;
      margin: 0 auto;
   }

   .ql-toolbar button.ql-importWord::before {
      content: '';
      display: inline-block;
      width: 18px;
      height: 18px;
      background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="%23444" d="M21.17 3.25q.33 0 .59.25q.24.24.24.58v15.84q0 .34-.24.58q-.26.25-.59.25H7.83q-.33 0-.59-.25q-.24-.24-.24-.58V17H2.83q-.33 0-.59-.24Q2 16.5 2 16.17V7.83q0-.33.24-.59Q2.5 7 2.83 7H7V4.08q0-.34.24-.58q.26-.25.59-.25zM4 8.5v6h10v-6zm13 10.42V19H8.5v-2.5h7q.33 0 .59-.24q.24-.26.24-.59V8.33q0-.33-.24-.59Q15.83 7.5 15.5 7.5h-7V5h8.5z"/></svg>');
      background-repeat: no-repeat;
      background-position: center;
   }
`;

if (typeof document !== 'undefined') {
   const styleSheet = document.createElement('style');
   styleSheet.innerText = styles;
   document.head.appendChild(styleSheet);
}

export type ArticleModalProps = {
   formValue: Article;
   title: string;
   show: boolean;
   onOk: VoidFunction;
   onCancel: VoidFunction;
   isCreate: boolean;
};

const CustomToolbar = {
   handlers: {
      importWord: function (this: any) {
         const input = document.createElement('input');
         input.setAttribute('type', 'file');
         input.setAttribute('accept', '.docx');
         input.click();

         input.onchange = async () => {
            const file = input.files?.[0];
            if (file) {
               try {
                  const arrayBuffer = await file.arrayBuffer();
                  const result = await mammoth.convertToHtml({ arrayBuffer });
                  const html = result.value;

                  // @ts-ignore
                  const editor = this.quill;
                  const range = editor.getSelection(true);

                  editor.clipboard.dangerouslyPasteHTML(range.index, html);

                  message.success('Đã import file Word thành công!');
               } catch (error) {
                  message.error('Lỗi khi import file Word!');
                  console.error(error);
               }
            }
         };
      },
   },
};

function transformApiResponseToArticleType(apiResponse: any): ArticleType {
   return {
      article_type_id: apiResponse?.article_type_id,
      article_title: apiResponse?.article_title,
      article_field: apiResponse?.article_field,
      is_highlight: apiResponse?.is_highlight,
   };
}

export function ArticleModal({ formValue, title, show, onOk, onCancel, isCreate }: ArticleModalProps) {
   console.log(formValue);
   const [form] = Form.useForm();
   const { notification } = App.useApp();
   const [imageBase64, setImageBase64] = useState<string>('');
   const [loading, setLoading] = useState(false);
   const [isFullscreen, setIsFullscreen] = useState(false);

   const convertToBase64 = (file: RcFile): Promise<string> => {
      return new Promise((resolve, reject) => {
         const reader = new FileReader();
         reader.readAsDataURL(file);
         reader.onload = () => resolve(reader.result as string);
         reader.onerror = (error) => reject(error);
      });
   };
   const userInfo = useSelector((state: RootState) => state.user.userInfo);

   const handleUpload = async (info: any) => {
      try {
         const { file } = info;
         if (!file) return;
         const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
         if (!isJpgOrPng) {
            notification.error({ message: 'Chỉ chấp nhận file JPG/PNG!' });
            return;
         }
         const isLt2M = file.size / 1024 / 1024 < 2;
         if (!isLt2M) {
            notification.error({ message: 'Kích thước ảnh phải nhỏ hơn 2MB!' });
            return;
         }
         const base64 = await convertToBase64(file);
         setImageBase64(base64);
      } catch (error) {
         notification.error({ message: 'Lỗi khi tải ảnh!' });
      }
   };

   useEffect(() => {
      if (show && !isCreate && formValue) {
         form.setFieldsValue({
            ...formValue,
            article_type_id: Number(formValue.article_type?.article_type_id),
            thumbnail_img: formValue.thumbnail_img,
         });
         setImageBase64(formValue.thumbnail_img);
      } else {
         form.resetFields();
         setImageBase64('');
      }
   }, [show, formValue, isCreate, form]);

   const [articleTypes, setArticleTypes] = useState<ArticleType[]>([]);

   useEffect(() => {
      const getArticleTypes = async () => {
         await articleAPI.getArticleTypes().then((res) => {
            if (res) {
               setArticleTypes(res.map(transformApiResponseToArticleType));
            }
         });
      };
      getArticleTypes();
   }, []);

   useEffect(() => {
      console.log('formValue', formValue);
      console.log('articleTypes', articleTypes);
      form.setFieldsValue(formValue);
      if (show && !isCreate && formValue.thumbnail_img) {
         setImageBase64(formValue.thumbnail_img);
      } else {
         setImageBase64('');
      }
   }, [show, formValue, isCreate, form]);

   const handleOk = () => {
      form.validateFields().then((formData) => {
         const submitData = {
            article_id: formValue.article_id || '',
            article_title: formData.article_title,
            article_content: formData.article_content,
            is_priority: formData.is_priority,
            article_type_id: formData.article_type_id,
            employee_id: userInfo.userId,
            thumbnail_img: imageBase64,
         };
         setLoading(true);
         const apiCall = isCreate ? articleAPI.createArticle(submitData) : articleAPI.updateArticle(submitData);
         apiCall
            .then((res) => {
               if (res && (res.status === 201 || res.status === 200)) {
                  notification.success({
                     message: `${isCreate ? 'Tạo' : 'Cập nhật'} bài viết thành công!`,
                     duration: 3,
                  });
                  onOk();
               } else {
                  notification.warning({
                     message: `${isCreate ? 'Tạo' : 'Cập nhật'} bài viết thất bại!`,
                     duration: 3,
                  });
               }
               if (res && res.status !== 201 && res.status !== 200) {
                  notification.warning({
                     message: `Lỗi: ${res.message}`,
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

   const modules = {
      toolbar: {
         container: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ script: 'sub' }, { script: 'super' }],
            [{ indent: '-1' }, { indent: '+1' }],
            [{ direction: 'rtl' }],
            [{ size: ['small', false, 'large', 'huge'] }],
            [{ color: [] }, { background: [] }],
            [{ font: [] }],
            [{ align: [] }],
            ['link', 'image', 'video'],
            ['clean'],
            ['importWord'],
         ],
         handlers: CustomToolbar.handlers,
      },
   };

   const content = (
      <Form
         form={form}
         layout="vertical"
         initialValues={formValue}
         style={{
            maxHeight: isFullscreen ? '90vh' : '70vh',
         }}
      >
         <Row gutter={16}>
            <Col span={12}>
               <Form.Item
                  name="article_title"
                  label="Tiêu đề"
                  rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
               >
                  <Input size="large" placeholder="Nhập tiêu đề bài viết" />
               </Form.Item>
            </Col>
            <Col span={6}>
               <Form.Item
                  name="article_type_id"
                  label="Loại bài viết"
                  rules={[{ required: true, message: 'Vui lòng chọn loại bài viết!' }]}
               >
                  <Select size="large" placeholder="Chọn loại bài viết">
                     {articleTypes?.map((type) => (
                        <Select.Option key={type?.article_type_id} value={type?.article_type_id}>
                           {type?.article_title}
                        </Select.Option>
                     ))}
                  </Select>
               </Form.Item>
            </Col>
            <Col span={6}>
               <Form.Item
                  name="is_priority"
                  label="Ưu tiên"
                  rules={[{ required: true, message: 'Vui lòng chọn mức độ ưu tiên!' }]}
               >
                  <Select
                     size="large"
                     placeholder="Chọn mức độ ưu tiên"
                     options={[
                        { value: 1, label: 'Có' },
                        { value: 0, label: 'Không' },
                     ]}
                  />
               </Form.Item>
            </Col>
         </Row>
         <Row gutter={16}>
            <Col span={4}>
               <Form.Item
                  label="Ảnh đại diện"
                  name="thumbnail_img"
                  rules={[{ required: true, message: 'Vui lòng tải lên ảnh đại diện!' }]}
               >
                  <Upload
                     listType="picture-card"
                     maxCount={1}
                     showUploadList={false}
                     beforeUpload={() => false}
                     onChange={handleUpload}
                     className="article-modal-avatar-uploader"
                     style={{
                        height: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                     }}
                  >
                     {imageBase64 ? (
                        <img
                           src={imageBase64}
                           alt="avatar"
                           style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                           }}
                        />
                     ) : (
                        <div className="flex flex-col items-center justify-center">
                           <Iconify icon="solar:upload-minimalistic-bold" size={24} />
                           <div className="mt-2">Tải ảnh lên</div>
                        </div>
                     )}
                  </Upload>
               </Form.Item>
            </Col>
            <Col span={20} style={{ width: '100%' }}>
               <Form.Item
                  name="article_content"
                  label="Nội dung bài viết"
                  rules={[{ required: true, message: 'Vui lòng nhập nội dung bài viết!' }]}
               >
                  <ReactQuill
                     theme="snow"
                     placeholder="Nhập nội dung bài viết"
                     modules={modules}
                     style={{ height: isFullscreen ? '60vh' : '400px' }}
                  />
               </Form.Item>
            </Col>
         </Row>
      </Form>
   );

   return (
      <Modal
         title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{title}</p>
               <Button
                  icon={<Iconify icon={isFullscreen ? 'mdi:fullscreen-exit' : 'mdi:fullscreen'} />}
                  onClick={() => setIsFullscreen(!isFullscreen)}
               />
            </div>
         }
         open={show}
         onOk={handleOk}
         onCancel={onCancel}
         width={isFullscreen ? '97%' : 1500}
         // className={`article-modal ${isFullscreen ? 'fullscreen' : ''}`}
         // height={isFullscreen ? '80vh' : '40vh'}
         style={{ minHeight: isFullscreen ? '80vh' : '40vh' }}
         centered
         destroyOnClose
      >
         <Spin spinning={loading} tip={isCreate ? 'Đang tạo...' : 'Đang cập nhật...'}>
            {content}
         </Spin>
      </Modal>
   );
}
