import { Modal } from 'antd';

interface TypeModalProps {
   open: boolean;
   onClose: () => void;
}

export default function TypeModal({ open, onClose }: TypeModalProps) {
   return (
      <Modal title="Vehicle Type Management" open={open} onCancel={onClose} footer={null} width={800} centered>
         {/* Nội dung quản lý loại xe */}
      </Modal>
   );
}
